"""Pruebas de las funciones añadidas en la 0.2 a partir del feedback."""
import sqlite3

from fastapi.testclient import TestClient

from conftest import make_client
from kaosnt.app import create_app
from kaosnt.config import Config
from kaosnt.db import MIGRATIONS_DIR, split_sql


def mk(c, **kw):
    r = c.post("/api/tasks", json=kw)
    assert r.status_code == 201, r.text
    return r.json()


def test_nombre_por_defecto(client):
    assert client.get("/api/settings").json()["app_name"] == "KAOSnt"


def test_migracion_desde_v01_con_copia_previa(tmp_path, clock):
    """Una base de la 0.1 (esquema 1, archivo centro.db) se renombra, se copia y se migra sin perder datos."""
    cfg = Config(data_dir=tmp_path / "d", port=8765)
    cfg.data_dir.mkdir(parents=True)
    conn = sqlite3.connect(str(cfg.data_dir / "centro.db"))
    for stmt in split_sql((MIGRATIONS_DIR / "001_inicial.sql").read_text(encoding="utf-8")):
        conn.execute(stmt)
    conn.execute("PRAGMA user_version = 1")
    conn.execute("""INSERT INTO settings VALUES ('holidays', '["2026-12-08","2026-12-25"]'), ('app_name', '"Centro de trabajo"')""")
    conn.execute("INSERT INTO people(name, is_me, created_at, updated_at) VALUES ('Yo', 1, 'x', 'x')")
    conn.commit()
    conn.close()
    with TestClient(create_app(cfg, clock=clock, background=False, extra_hosts=("testserver",))) as c:
        hol = c.get("/api/holidays").json()
        assert [h["date"] for h in hol] == ["2026-12-08", "2026-12-25"] and all(h["location_id"] is None for h in hol)
        assert c.get("/api/settings").json()["app_name"] == "KAOSnt"
        assert [p["name"] for p in c.get("/api/people").json()] == ["Yo"]
    assert (cfg.data_dir / "kaosnt.db").exists() and not (cfg.data_dir / "centro.db").exists()
    assert list(cfg.backup_dir.glob("*-previa-migracion.db"))


def test_festivos_por_oficina_y_contexto_calendario(client):
    norte = client.post("/api/locations", json={"name": "Norte"}).json()["id"]
    sur = client.post("/api/locations", json={"name": "Sur"}).json()["id"]
    assert client.post("/api/locations", json={"name": "norte"}).status_code == 422  # único sin distinguir mayúsculas
    ana = client.post("/api/people", json={"name": "Ana", "location_id": norte, "weekly_capacity_hours": 40}).json()["id"]
    luis = client.post("/api/people", json={"name": "Luis", "location_id": sur}).json()["id"]
    assert client.post("/api/holidays", json={"date": "2026-10-15", "name": "Local", "location_id": norte}).status_code == 201
    assert client.post("/api/holidays", json={"date": "2026-10-15", "location_id": norte}).status_code == 422
    client.post("/api/holidays", json={"date": "2026-10-16", "name": "Común"})
    client.post("/api/absences", json={"person_id": luis, "start_date": "2026-10-14", "end_date": "2026-10-14"})
    ctx = client.get("/api/calendar-context?start=2026-10-12&end=2026-10-18").json()["days"]
    assert ctx["2026-10-15"]["holidays"][0]["people"] == ["Ana"]
    assert set(ctx["2026-10-16"]["holidays"][0]["people"]) >= {"Ana", "Luis"}
    assert ctx["2026-10-14"]["absences"] == [{"person_id": luis, "name": "Luis"}]
    # disponibilidad registrada: 5 laborables − 2 festivos (local + común) = 3 → 24 h de 40
    pa = next(p for p in client.get("/api/planning?week=2026-10-12").json()["people"] if p["person_id"] == ana)
    assert pa["availability"] == {"nominal_days": 5, "holiday_days": 2, "absence_days": 0, "available_days": 3, "available_hours": 24.0}
    # tarea planificada en festivo de su oficina → conflicto señalado, sin reasignar
    t = mk(client, title="Taller", assignee_id=ana, planned_date="2026-10-15")
    pa = next(p for p in client.get("/api/planning?week=2026-10-12").json()["people"] if p["person_id"] == ana)
    assert pa["conflicts"][0] == {"task_id": t["id"], "title": "Taller", "field": "planned_date", "date": "2026-10-15", "reason": "festivo"}
    # la recurrencia de días laborables de Ana salta su festivo local; la de Luis no
    ra = client.post("/api/recurrences", json={"title": "Diario A", "rule": "laborables", "start_date": "2026-10-13", "assignee_id": ana}).json()
    rl = client.post("/api/recurrences", json={"title": "Diario L", "rule": "laborables", "start_date": "2026-10-13", "assignee_id": luis}).json()
    da = {x["occurrence_date"] for x in client.get(f"/api/tasks?recurrence_id={ra['id']}").json()}
    dl = {x["occurrence_date"] for x in client.get(f"/api/tasks?recurrence_id={rl['id']}").json()}
    assert "2026-10-15" not in da and "2026-10-15" in dl and "2026-10-16" not in dl
    # Hoy muestra los festivos de la semana de cada persona
    team = {x["name"]: x for x in client.get("/api/today").json()["team"]}
    assert [h["date"] for h in team["Ana"]["holidays"]] == ["2026-10-15", "2026-10-16"]
    # borrar oficina: sus festivos desaparecen y la persona queda sin oficina
    client.delete(f"/api/locations/{norte}")
    assert next(p for p in client.get("/api/people").json() if p["id"] == ana)["location_id"] is None
    assert all(h["location_id"] != norte for h in client.get("/api/holidays").json())


def test_clientes_gestion(client):
    c1 = client.post("/api/clients", json={"name": "Alfa"}).json()["id"]
    c2 = client.post("/api/clients", json={"name": "Beta"}).json()["id"]
    p = client.post("/api/projects", json={"name": "P", "client_id": c1}).json()["id"]
    assert client.patch(f"/api/clients/{c1}", json={"name": "Alfa SA"}).json()["name"] == "Alfa SA"
    assert client.patch(f"/api/projects/{p}", json={"client_id": c2}).json()["client"]["name"] == "Beta"
    assert client.patch(f"/api/projects/{p}", json={"client_id": 999}).status_code == 422
    assert {c["name"]: c["projects"] for c in client.get("/api/clients").json()} == {"Alfa SA": 0, "Beta": 1}
    client.delete(f"/api/clients/{c2}")
    assert client.get(f"/api/projects/{p}").json()["client"] is None  # el proyecto se conserva


def test_dedicacion_por_proyecto(client):
    a = client.post("/api/people", json={"name": "Ana", "weekly_capacity_hours": 40}).json()["id"]
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    client.post(f"/api/projects/{p}/people", json={"person_id": a, "dedication_pct": 50})
    assert client.get(f"/api/projects/{p}").json()["people"][0]["dedication_hours"] == 20
    mk(client, title="T", project_id=p, assignee_id=a, planned_date="2026-10-14", estimate_hours=6)
    mk(client, title="U", project_id=p, assignee_id=a, planned_date="2026-10-14")
    bp = next(x for x in client.get("/api/planning?week=2026-10-12").json()["people"] if x["person_id"] == a)["by_project"]
    assert bp == [{"project_id": p, "name": "P", "dedication_pct": 50, "dedication_hours": 20.0, "counted_hours": 6, "unestimated": 1}]
    client.post(f"/api/projects/{p}/people", json={"person_id": a, "dedication_pct": None})
    assert client.get(f"/api/projects/{p}").json()["people"][0]["dedication_hours"] is None
    assert client.post(f"/api/projects/{p}/people", json={"person_id": a, "dedication_pct": 150}).status_code == 422


def test_hacer_recurrente_una_tarea(client):
    t = mk(client, title="Daily", due_date="2026-10-14")
    d = client.post(f"/api/tasks/{t['id']}/recurrence", json={"rule": "semanal", "weekdays": [1, 3]}).json()
    assert d["recurrence"]["rule"] == "semanal" and d["recurrence"]["weekdays"] == [1, 3] and d["occurrence_date"] == "2026-10-14"
    occ = sorted(x["occurrence_date"] for x in client.get(f"/api/tasks?recurrence_id={d['recurrence_id']}").json())
    assert occ == ["2026-10-14", "2026-10-19"]  # sin duplicar la tarea original (miércoles 14)
    assert client.post(f"/api/tasks/{t['id']}/recurrence", json={"rule": "diaria"}).status_code == 422
    assert client.post(f"/api/tasks/{mk(client, title='x')['id']}/recurrence", json={"rule": "semanal"}).status_code == 422


def test_historial_editable_solo_manual(client, clock):
    t = mk(client, title="T")
    d = client.post(f"/api/tasks/{t['id']}/update", json={"text": "Llamé al cliente"}).json()
    manual = next(h for h in d["history"] if h["kind"] == "actualizacion")
    auto = next(h for h in d["history"] if h["kind"] == "cambio")
    assert manual["editable"] and not auto["editable"]
    lsu = d["last_significant_update"]
    from datetime import timedelta
    clock.dt += timedelta(hours=1)
    d2 = client.patch(f"/api/tasks/{t['id']}/history/{manual['id']}", json={"text": "Llamé al cliente; respuesta el lunes"}).json()
    e = next(h for h in d2["history"] if h["id"] == manual["id"])
    assert e["text"].endswith("lunes") and e["edited_at"] and d2["last_significant_update"] == lsu
    r = client.patch(f"/api/tasks/{t['id']}/history/{auto['id']}", json={"text": "manipulado"})
    assert r.status_code == 422 and r.json()["code"] == "no_editable"


def test_pasos_y_subtareas(client):
    padre = mk(client, title="Preparar entrega")
    d = client.post(f"/api/tasks/{padre['id']}/steps", json={"text": "Revisar plantilla"}).json()
    client.post(f"/api/tasks/{padre['id']}/steps", json={"text": "Exportar PDF"})
    s1 = d["steps"][0]
    d = client.patch(f"/api/steps/{s1['id']}", json={"done": True}).json()
    assert d["steps_done"] == 1 and d["steps_total"] == 2 and d["status"] == "pendiente"  # no completa la tarea
    # los pasos no aparecen como tareas
    assert [t["title"] for t in client.get("/api/tasks").json()] == ["Preparar entrega"]
    # convertir paso en subtarea completa
    s2 = next(s for s in d["steps"] if not s["done"])
    sub = client.post(f"/api/steps/{s2['id']}/promote").json()
    assert sub["parent_id"] == padre["id"] and sub["parent_title"] == "Preparar entrega"
    listed = {t["title"]: t for t in client.get("/api/tasks").json()}
    assert listed["Exportar PDF"]["parent_title"] == "Preparar entrega"
    assert listed["Preparar entrega"]["subtasks_total"] == 1 and listed["Preparar entrega"]["steps_total"] == 1
    # búsqueda encuentra el texto de los pasos
    assert client.get("/api/search?q=plantilla").json()["results"][0]["id"] == padre["id"]


def test_archivadas_listado_y_borrado(client):
    t = mk(client, title="Vieja")
    mk(client, title="Viva")
    client.patch(f"/api/tasks/{t['id']}", json={"archived": True})
    assert [x["title"] for x in client.get("/api/tasks?archived=only").json()] == ["Vieja"]
    assert "Vieja" not in [x["title"] for x in client.get("/api/tasks").json()]
    assert client.delete(f"/api/tasks/{t['id']}").status_code == 200
    assert client.get("/api/tasks?archived=only").json() == []


def test_etiquetas_reutilizables(client):
    a = mk(client, title="A", tags=["Cliente", "cliente", " urgente "])
    assert a["tags"] == ["Cliente", "urgente"]
    b = mk(client, title="B", tags=["CLIENTE"])
    assert b["tags"] == ["Cliente"]  # misma etiqueta, sin duplicados
    tags = {t["name"]: t for t in client.get("/api/tags").json()}
    assert tags["Cliente"]["tasks"] == 2
    client.patch(f"/api/tags/{tags['urgente']['id']}", json={"name": "Prioritario"})
    assert client.get(f"/api/tasks/{a['id']}").json()["tags"] == ["Cliente", "Prioritario"]
    # renombrar a una existente fusiona
    client.patch(f"/api/tags/{tags['Cliente']['id']}", json={"name": "Prioritario"})
    assert client.get(f"/api/tasks/{a['id']}").json()["tags"] == ["Prioritario"]
    assert [t["name"] for t in client.get("/api/tags").json()] == ["Prioritario"]
    tid = client.get("/api/tags").json()[0]["id"]
    client.delete(f"/api/tags/{tid}")
    assert client.get(f"/api/tasks/{b['id']}").json()["tags"] == []


def test_nota_vinculada_desde_tarea(client):
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    t = mk(client, title="T", project_id=p)
    n = client.post("/api/notes", json={"task_id": t["id"]}).json()
    assert n["tasks"][0]["id"] == t["id"] and n["project_id"] == p
    assert client.get(f"/api/tasks/{t['id']}").json()["notes"][0]["id"] == n["id"]
    assert client.post("/api/notes", json={"task_id": 999}).status_code == 422


def test_nota_desde_tarea_sin_id_en_historial(client):
    n = client.post("/api/notes", json={"content": "Acta reunión\n- algo"}).json()
    t = client.post(f"/api/notes/{n['id']}/to-task", json={"title": "Algo"}).json()
    assert any("«Acta reunión»" in h["text"] for h in t["history"])
