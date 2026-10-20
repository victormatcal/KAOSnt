"""Pruebas de las funciones añadidas en la 0.3."""
import json
import sqlite3
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from conftest import make_client
from kaosnt import themes
from kaosnt.app import create_app
from kaosnt.config import Config
from kaosnt.db import MIGRATIONS_DIR, split_sql
from kaosnt.timeutil import add_hours, business_hours_between

REPO = Path(__file__).resolve().parents[2]
SCHED = {"1": {"start": "09:00", "end": "19:00"}, "2": {"start": "09:00", "end": "19:00"},
         "3": {"start": "09:00", "end": "19:00"}, "4": {"start": "09:00", "end": "19:00"},
         "5": {"start": "09:00", "end": "15:00"}, "6": None, "7": None}


def mk(c, **kw):
    r = c.post("/api/tasks", json=kw)
    assert r.status_code == 201, r.text
    return r.json()


# ---------------- 13) Horario laboral por día ----------------
def test_horario_por_dia_viernes_corto_y_cambio_de_hora():
    s = {"timezone": "Europe/Madrid", "work_schedule": SCHED, "holidays": []}
    start = datetime(2026, 10, 23, 11, 0, tzinfo=timezone.utc)  # viernes 13:00 CEST; el viernes acaba a las 15:00
    end = add_hours(start, 3, "laborable", s)
    assert end == datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc)  # 2 h el viernes + 1 h el lunes (10:00 CET)
    assert abs(business_hours_between(start, end, s) - 3) < 1e-9
    # semana completa: 4 × 10 h + 6 h
    a = datetime(2026, 10, 18, 22, 0, tzinfo=timezone.utc)  # lunes 00:00 CEST
    assert abs(business_hours_between(a, a + timedelta(days=7), s) - 46) < 1e-9


def test_horario_ajuste_validacion_y_disponibilidad_proporcional(client):
    assert client.get("/api/settings").json()["work_schedule"]["6"] is None
    bad = dict(SCHED, **{"5": {"start": "15:00", "end": "09:00"}})
    assert client.patch("/api/settings", json={"work_schedule": bad}).status_code == 422
    assert client.patch("/api/settings", json={"work_schedule": {"1": None}}).status_code == 422
    assert client.patch("/api/settings", json={"work_schedule": SCHED}).status_code == 200
    a = client.post("/api/people", json={"name": "Ana", "weekly_capacity_hours": 46}).json()["id"]
    client.post("/api/holidays", json={"date": "2026-10-16"})  # el viernes corto (6 h) es festivo
    pa = next(p for p in client.get("/api/planning?week=2026-10-12").json()["people"] if p["person_id"] == a)
    assert pa["availability"] == {"nominal_days": 5, "holiday_days": 1, "absence_days": 0, "available_days": 4,
                                  "available_hours": 40.0}  # 46 × 40/46
    # recurrencia «laborables» respeta el horario: sábado y domingo no
    r = client.post("/api/recurrences", json={"title": "Parte", "rule": "laborables", "start_date": "2026-10-13"}).json()
    occ = {x["occurrence_date"] for x in client.get(f"/api/tasks?recurrence_id={r['id']}").json()}
    assert "2026-10-17" not in occ and "2026-10-15" in occ and "2026-10-16" not in occ


def _db_v02(path: Path, extra_sql: list[str]) -> None:
    conn = sqlite3.connect(str(path))
    for f in ("001_inicial.sql", "002_v02.sql"):
        for stmt in split_sql((MIGRATIONS_DIR / f).read_text(encoding="utf-8")):
            conn.execute(stmt)
    conn.execute("PRAGMA user_version = 2")
    for q in extra_sql:
        conn.execute(q)
    conn.commit()
    conn.close()


def test_migracion_desde_v02_con_copia_y_horario(tmp_path, clock):
    cfg = Config(data_dir=tmp_path / "d", port=8765)
    cfg.data_dir.mkdir(parents=True)
    _db_v02(cfg.db_path, [
        "INSERT INTO settings VALUES ('workdays', '[1,2,3,4]'), ('work_start', '\"08:00\"'), ('work_end', '\"17:30\"')",
        "INSERT INTO people(name, is_me, created_at, updated_at) VALUES ('Yo', 1, 'x', 'x')",
        """INSERT INTO recurrences(title, rule, start_date, created_at, updated_at) VALUES ('Antigua', 'diaria', '2026-10-13', 'x', 'x')""",
    ])
    with TestClient(create_app(cfg, clock=clock, background=False, extra_hosts=("testserver",))) as c:
        c.headers.update({"X-KAOSnt": "1"})
        sch = c.get("/api/settings").json()["work_schedule"]
        assert sch["1"] == {"start": "08:00", "end": "17:30"} and sch["5"] is None and sch["7"] is None
        # la serie de la 0.2 (sin plantilla) sigue generando
        c.get("/api/today")
        assert c.get("/api/tasks?recurrence_id=1").json()
        assert c.get("/api/recurrences").json()[0]["template"] is None
    assert list(cfg.backup_dir.glob("*-previa-migracion.db"))
    conn = sqlite3.connect(str(cfg.db_path))
    assert conn.execute("PRAGMA user_version").fetchone()[0] == 3
    assert not conn.execute("SELECT 1 FROM settings WHERE key = 'workdays'").fetchone()


# ---------------- 1) Deshacer ----------------
def test_deshacer_restaura_campos_exactos(client, clock):
    t = mk(client, title="A", status="en_curso")
    before = client.get(f"/api/tasks/{t['id']}").json()
    clock.dt += timedelta(hours=2)
    r = client.patch(f"/api/tasks/{t['id']}?undo=1", json={"status": "hecha"}).json()
    assert r["status"] == "hecha" and r["completed_at"] and r["undo_id"]
    assert client.post(f"/api/undo/{r['undo_id']}").json()["ok"]
    after = client.get(f"/api/tasks/{t['id']}").json()
    for k in ("status", "completed_at", "started_at", "position", "last_significant_update", "archived"):
        assert after[k] == before[k], k
    assert client.post(f"/api/undo/{r['undo_id']}").status_code == 422  # solo una vez
    # sin ?undo no se crea instantánea
    assert "undo_id" not in client.patch(f"/api/tasks/{t['id']}", json={"priority": "alta"}).json()


def test_deshacer_mover_columna_saltar_y_resolver_espera(client):
    a, b = mk(client, title="A"), mk(client, title="B")
    pos = client.get(f"/api/tasks/{a['id']}").json()["position"]
    r = client.post(f"/api/tasks/{a['id']}/reorder?undo=1", json={"status": "en_curso"}).json()
    assert r["status"] == "en_curso" and r["started_at"]
    client.post(f"/api/undo/{r['undo_id']}")
    x = client.get(f"/api/tasks/{a['id']}").json()
    assert x["status"] == "pendiente" and x["started_at"] is None and x["position"] == pos
    w = client.patch(f"/api/tasks/{b['id']}", json={"condition": "espera", "wait_on": "Cliente"}).json()
    r = client.patch(f"/api/tasks/{b['id']}?undo=1", json={"condition": None}).json()
    client.post(f"/api/undo/{r['undo_id']}")
    y = client.get(f"/api/tasks/{b['id']}").json()
    assert y["condition"] == "espera" and y["wait_since"] == w["wait_since"]
    rec = client.post("/api/recurrences", json={"title": "R", "rule": "diaria", "start_date": "2026-10-13"}).json()
    occ = client.get(f"/api/tasks?recurrence_id={rec['id']}").json()[0]
    s = client.post(f"/api/tasks/{occ['id']}/skip?undo=1").json()
    assert s["status"] == "cancelada"
    client.post(f"/api/undo/{s['undo_id']}")
    assert client.get(f"/api/tasks/{occ['id']}").json()["status"] == "pendiente"


def test_archivado_masivo_y_deshacer_en_conjunto(client):
    ids = [mk(client, title=f"H{i}", status="hecha")["id"] for i in range(3)]
    r = client.post("/api/tasks/archive-bulk", json={"ids": ids}).json()
    assert r["archived"] == 3
    assert [x["title"] for x in client.get("/api/tasks?archived=only").json()].__len__() == 3
    client.post(f"/api/undo/{r['undo_id']}")
    assert client.get("/api/tasks?archived=only").json() == []
    assert client.post("/api/tasks/archive-bulk", json={"ids": []}).status_code == 422


def test_deshacer_nota_recordatorio_e_hito(client):
    n = client.post("/api/notes", json={"content": "x"}).json()
    r = client.patch(f"/api/notes/{n['id']}?undo=1", json={"state": "papelera"}).json()
    assert r["state"] == "papelera"
    client.post(f"/api/undo/{r['undo_id']}")
    assert client.get(f"/api/notes/{n['id']}").json()["state"] == "activa"
    assert client.patch(f"/api/notes/{n['id']}?undo=1", json={"content": "y"}).status_code == 422
    client.post("/api/reminders", json={"title": "Llamar", "due_at": "2026-10-13T08:00:00Z"})
    rem = client.get("/api/reminders").json()["active"][0]
    u = client.post(f"/api/reminders/{rem['id']}/action?undo=1", json={"action": "atendido"}).json()
    assert not client.get("/api/reminders").json()["active"]
    client.post(f"/api/undo/{u['undo_id']}")
    assert client.get("/api/reminders").json()["active"][0]["id"] == rem["id"]
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    m = client.post(f"/api/projects/{p}/milestones", json={"title": "Hito"}).json()
    u = client.patch(f"/api/milestones/{m['id']}?undo=1", json={"status": "cumplido"}).json()
    client.post(f"/api/undo/{u['undo_id']}")
    assert client.get(f"/api/projects/{p}").json()["milestones"][0]["status"] == "pendiente"


def test_deshacer_caduca(client, clock):
    t = mk(client, title="A")
    r = client.patch(f"/api/tasks/{t['id']}?undo=1", json={"status": "hecha"}).json()
    clock.dt += timedelta(minutes=16)
    assert client.post(f"/api/undo/{r['undo_id']}").json()["code"] == "sin_deshacer"


# ---------------- 3) Temas ----------------
def test_temas_integrados_validos_y_con_contraste():
    base = json.loads((REPO / "temas" / "predeterminado.json").read_text(encoding="utf-8"))
    files = sorted((REPO / "temas").glob("*.json"))
    assert {f.stem for f in files} >= set(themes.BUILTIN_IDS)
    for f in files:
        th = themes.validate(json.loads(f.read_text(encoding="utf-8")))
        for mode in ("light", "dark"):
            assert themes.contrast_report({**base[mode], **th[mode]}) == [], (f.name, mode)
    assert set(base["light"]) == set(themes.COLOR_VARS) == set(base["dark"])


@pytest.mark.parametrize("bad", [
    {"light": {"bg": "url(http://x)"}}, {"light": {"bg": "red; background:url(x)"}}, {"light": {"inventada": "#fff"}},
    {"font": "Comic Sans"}, {"radius": 40}, {"css": "body{}"}, {"format": "otro"}, {"id": "Con Espacios"},
])
def test_temas_rechaza_css_libre_urls_y_fuentes(client, bad):
    th = {"format": "kaosnt-theme", "version": 1, "id": "mio", "name": "Mío", "light": {}, "dark": {}, **bad}
    assert client.post("/api/themes", json=th).status_code == 422


def test_temas_importar_seleccionar_y_borrar(client):
    th = json.loads((REPO / "temas" / "ejemplo-mi-tema.json").read_text(encoding="utf-8"))
    assert client.post("/api/themes", json=th).status_code == 201
    assert client.post("/api/themes", json={**th, "id": "retro"}).status_code == 422  # id reservado
    assert client.patch("/api/settings", json={"theme_id": "mi-tema", "theme_mode": "oscuro"}).status_code == 200
    assert client.patch("/api/settings", json={"theme_id": "no-existe"}).status_code == 422
    assert client.patch("/api/settings", json={"custom_themes": []}).status_code == 422  # solo vía /api/themes
    client.delete("/api/themes/mi-tema")
    s = client.get("/api/settings").json()
    assert s["custom_themes"] == [] and s["theme_id"] == "predeterminado"
    for k, v in (("language", "fr"), ("date_format", "dd.mm.yy"), ("week_start", 3), ("theme_mode", "azul"), ("undo_seconds", 0)):
        assert client.patch("/api/settings", json={k: v}).status_code == 422, k
    assert client.patch("/api/settings", json={"language": "en", "date_format": "aaaa-mm-dd", "week_start": 7, "undo_seconds": 12}).status_code == 200


# ---------------- 4) Festivos en bloque ----------------
def test_festivos_en_bloque_vista_previa_e_importacion(client):
    norte = client.post("/api/locations", json={"name": "Norte"}).json()["id"]
    client.post("/api/holidays", json={"date": "2026-12-08", "location_id": None})
    text = "\n".join(["día;nombre;oficina", "08/12/2026;Inmaculada;", "25/12/2026;Navidad;Común",
                      "2026-04-23\tSan Jorge\tnorte", "23/04/2026,San Jorge,Norte", "31/02/2026;Imposible;",
                      "12/10/2026;Pilar;Zaragoza", "1/1/2027"])
    r = client.post("/api/holidays/import", json={"text": text}).json()
    st = [(x["line"], x["status"], x.get("reason_code")) for x in r["lines"]]
    assert st == [(2, "duplicado", "existe"), (3, "importar", ""), (4, "importar", ""), (5, "duplicado", "repetido"),
                  (6, "error", "fecha"), (7, "error", "oficina"), (8, "importar", "")]
    assert r["created"] == 0 and not client.get("/api/holidays?year=2027").json()  # vista previa: no guarda
    r = client.post("/api/holidays/import", json={"text": text, "dry_run": False}).json()
    assert r["created"] == 3
    assert not any(h["date"] == "2026-10-12" for h in client.get("/api/holidays").json())  # nunca como común
    assert next(h for h in client.get("/api/holidays").json() if h["date"] == "2026-04-23")["location_id"] == norte
    r = client.post("/api/holidays/import", json={"text": "12/10/2026;Pilar;Zaragoza", "create_locations": True, "dry_run": False}).json()
    assert r["created"] == 1 and r["lines"][0]["reason_code"] == "nueva_oficina"
    assert any(l["name"] == "Zaragoza" for l in client.get("/api/locations").json())


# ---------------- 6) Recordatorios visibles ----------------
def test_centro_de_recordatorios(client, clock):
    t = mk(client, title="T")
    fut = client.post("/api/reminders", json={"title": "Futuro", "due_at": "2026-10-15T08:00:00Z", "task_id": t["id"]}).json()
    lejos = client.post("/api/reminders", json={"title": "Lejos", "due_at": "2026-11-20T08:00:00Z"}).json()
    data = client.get("/api/reminders").json()
    assert [r["title"] for r in data["scheduled"]] == ["Futuro", "Lejos"] and not data["active"]
    assert [r["title"] for r in client.get("/api/today").json()["scheduled"]] == ["Futuro"]  # solo esta semana
    assert [r["title"] for r in client.get(f"/api/tasks/{t['id']}/reminders").json()["scheduled"]] == ["Futuro"]
    assert client.patch(f"/api/reminders/{fut['id']}", json={"title": "Futuro editado", "due_at": "2026-10-13T09:00:00Z"}).status_code == 200
    act = client.get("/api/reminders").json()["active"]
    assert act[0]["title"] == "Futuro editado"
    client.post(f"/api/reminders/{act[0]['id']}/action", json={"action": "atendido"})
    res = client.get("/api/reminders").json()["resolved"]
    assert res[0]["id"] == fut["id"]
    client.post(f"/api/reminders/{fut['id']}/action", json={"action": "reabrir"})
    assert client.get("/api/reminders").json()["active"][0]["id"] == fut["id"]
    assert client.delete(f"/api/reminders/{lejos['id']}").status_code == 200
    assert not client.get("/api/reminders").json()["scheduled"]
    mk(client, title="Vence", due_date="2026-10-13")
    auto = next(r for r in client.get("/api/reminders").json()["active"] if r["rule"] == "vence")
    assert client.delete(f"/api/reminders/{auto['id']}").status_code == 422
    assert client.patch(f"/api/reminders/{auto['id']}", json={"title": "x"}).status_code == 422


# ---------------- 9-11) Recurrentes ----------------
def test_hacer_recurrente_hereda_todo_y_desplaza_fechas(client):
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    g = client.post(f"/api/projects/{p}/groupings", json={"kind": "linea", "name": "L"}).json()["id"]
    ana = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    luis = client.post("/api/people", json={"name": "Luis"}).json()["id"]
    padre = mk(client, title="Padre")
    t = mk(client, title="Informe", project_id=p, workstream_id=g, assignee_id=ana, reviewer_id=luis, kind="mejora",
           priority="alta", estimate_hours=2, description="desc", parent_id=padre["id"], approval="pendiente",
           review_after_idle_hours=8, review_hours_mode="laborable", links=[{"label": "doc", "url": "https://example.com"}],
           tags=["cliente"], due_date="2026-10-14", planned_date="2026-10-13", next_review_at="2026-10-14T07:00:00Z")
    client.post(f"/api/tasks/{t['id']}/steps", json={"text": "Paso 1"})
    sid = client.get(f"/api/tasks/{t['id']}").json()["steps"][0]["id"]
    client.patch(f"/api/steps/{sid}", json={"done": True})
    client.post("/api/reminders", json={"title": "Avisar", "due_at": "2026-10-13T16:00:00Z", "task_id": t["id"]})
    client.patch("/api/settings", json={"recurrence_horizon_days": 10})
    d = client.post(f"/api/tasks/{t['id']}/recurrence", json={"rule": "semanal", "weekdays": [3]}).json()
    occ = [x for x in client.get(f"/api/tasks?recurrence_id={d['recurrence_id']}").json() if x["id"] != t["id"]]
    assert [x["occurrence_date"] for x in occ] == ["2026-10-21"]
    o = client.get(f"/api/tasks/{occ[0]['id']}").json()
    for k in ("project_id", "workstream_id", "assignee_id", "reviewer_id", "kind", "priority", "estimate_hours",
              "description", "parent_id", "approval", "review_after_idle_hours", "review_hours_mode", "links", "tags"):
        assert o[k] == client.get(f"/api/tasks/{t['id']}").json()[k], k
    assert o["due_date"] == "2026-10-21" and o["planned_date"] == "2026-10-20"  # 1 día antes, como la original
    assert o["next_review_at"] == "2026-10-21T07:00:00Z"
    assert [(s["text"], s["done"]) for s in o["steps"]] == [("Paso 1", False)]  # pasos sin marcar
    rem = client.get(f"/api/tasks/{o['id']}/reminders").json()["scheduled"]
    assert [(r["title"], r["due_at"]) for r in rem] == [("Avisar", "2026-10-20T16:00:00Z")]


def test_referencias_borradas_no_rompen_la_generacion(client, clock):
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    ana = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    t = mk(client, title="X", project_id=p, assignee_id=ana, due_date="2026-10-13")
    d = client.post(f"/api/tasks/{t['id']}/recurrence", json={"rule": "diaria"}).json()
    client.post(f"/api/projects/{p}/delete", json={"mode": "desvincular", "confirm": True})
    clock.dt += timedelta(days=10)
    assert client.get("/api/today").status_code == 200
    newest = max(client.get(f"/api/tasks?recurrence_id={d['recurrence_id']}").json(), key=lambda x: x["occurrence_date"])
    assert newest["occurrence_date"] > "2026-10-20" and newest["project_id"] is None and newest["assignee_id"] == ana


def test_aplicar_a_la_serie(client):
    t = mk(client, title="Daily", due_date="2026-10-13")
    d = client.post(f"/api/tasks/{t['id']}/recurrence", json={"rule": "diaria"}).json()
    occ = sorted(client.get(f"/api/tasks?recurrence_id={d['recurrence_id']}").json(), key=lambda x: x["occurrence_date"])
    hecha = occ[2]["id"]
    client.patch(f"/api/tasks/{hecha}", json={"status": "hecha"})
    client.patch(f"/api/tasks/{occ[1]['id']}", json={"title": "Daily v2", "priority": "urgente", "tags": ["nuevo"]})
    r = client.post(f"/api/tasks/{occ[1]['id']}/apply-to-series").json()
    assert r["updated_occurrences"] == len(occ) - 2  # desde hoy, sin esta ni la hecha
    after = {x["id"]: x for x in client.get(f"/api/tasks?recurrence_id={d['recurrence_id']}&include_closed=1").json()}
    assert after[hecha]["title"] == "Daily" and after[occ[-1]["id"]]["title"] == "Daily v2"
    assert after[occ[-1]["id"]]["priority"] == "urgente" and after[occ[-1]["id"]]["tags"] == ["nuevo"]
    rec = next(x for x in client.get("/api/recurrences").json() if x["id"] == d["recurrence_id"])
    assert rec["title"] == "Daily v2" and rec["template"]["priority"] == "urgente"


@pytest.mark.parametrize("mode", ["conservar", "eliminar_pendientes"])
def test_eliminar_serie(client, mode):
    r = client.post("/api/recurrences", json={"title": "S", "rule": "diaria", "start_date": "2026-10-13"}).json()
    occ = client.get(f"/api/tasks?recurrence_id={r['id']}").json()
    client.patch(f"/api/tasks/{occ[0]['id']}", json={"status": "hecha"})
    client.patch(f"/api/tasks/{occ[1]['id']}", json={"status": "en_curso"})
    res = client.delete(f"/api/recurrences/{r['id']}?mode={mode}").json()
    left = client.get("/api/tasks?include_closed=1").json()
    assert not client.get("/api/recurrences").json()
    assert all(x["recurrence_id"] is None for x in left)
    if mode == "conservar":
        assert len(left) == len(occ) and res["deleted"] == 0
    else:
        assert sorted(x["id"] for x in left) == sorted([occ[0]["id"], occ[1]["id"]])  # hecha y en curso se conservan
    assert client.delete("/api/recurrences/999?mode=conservar").status_code == 404
    assert client.delete(f"/api/recurrences/{r['id']}?mode=otro").status_code == 422


def test_hoy_una_entrada_por_serie_y_aviso_solo_de_la_mas_antigua(client, clock):
    r = client.post("/api/recurrences", json={"title": "Diaria", "rule": "diaria", "start_date": "2026-10-12"}).json()
    today = client.get("/api/today").json()
    items = [x for x in today["sections"]["vence"] if x["recurrence_id"] == r["id"]]
    assert len(items) == 1 and items[0]["series_more"] >= 4 and items[0]["occurrence_date"] == "2026-10-12"
    venc = [x for x in client.get("/api/reminders").json()["active"] if x["rule"] == "vence"]
    assert len(venc) == 1 and venc[0]["task_id"] == items[0]["id"]


# ---------------- 12) Borrar todo ----------------
def test_borrar_todo_con_confirmacion_y_copia(client, cfg):
    mk(client, title="A")
    client.post("/api/notes", json={"content": "n"})
    client.patch("/api/settings", json={"app_name": "Mi KAOS"})
    assert client.post("/api/system/reset", json={"confirm_text": "si"}).status_code == 422
    r = client.post("/api/system/reset", json={"confirm_text": "mi kaos"}).json()
    assert (cfg.backup_dir / r["previous_backup"]).exists() and r["previous_backup"].endswith("-previa-borrado.db")
    assert client.get("/api/tasks?include_closed=1&include_backlog=1").json() == []
    assert [p["name"] for p in client.get("/api/people").json()] == ["Yo"]
    assert client.get("/api/settings").json()["app_name"] == "KAOSnt"
    assert any(b["reason"] == "previa-borrado" for b in client.get("/api/backups").json()["items"])


def test_borrar_todo_en_demo_recarga_datos(tmp_path, clock):
    cfg = Config(data_dir=tmp_path / "demo", port=8766, demo=True)
    from kaosnt.demo import seed_if_empty
    cfg.ensure_dirs()
    seed_if_empty(cfg)
    c = TestClient(create_app(cfg, clock=clock, background=False, extra_hosts=("testserver",)))
    c.headers.update({"X-KAOSnt": "1"})
    with c:
        r = c.post("/api/system/reset", json={"confirm_text": "BORRAR TODO", "reseed_demo": True}).json()
        assert r["reseeded"] and len(c.get("/api/projects").json()) == 3
        assert sum(1 for p in c.get("/api/people").json() if p["is_me"]) == 1


# ---------------- 14) Eliminar proyectos ----------------
@pytest.mark.parametrize("mode", ["desvincular", "eliminar"])
def test_eliminar_proyecto(client, cfg, mode):
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    t = mk(client, title="T", project_id=p)
    otra = mk(client, title="Otra")
    n = client.post("/api/notes", json={"content": "n", "project_id": p}).json()
    client.post("/api/recurrences", json={"title": "R", "rule": "semanal", "weekdays": [5], "start_date": "2026-11-01", "project_id": p})
    assert client.post(f"/api/projects/{p}/delete", json={"mode": mode}).status_code == 422  # sin confirmar
    r = client.post(f"/api/projects/{p}/delete", json={"mode": mode, "confirm": True}).json()
    assert (cfg.backup_dir / r["previous_backup"]).exists()
    assert client.get(f"/api/projects/{p}").status_code == 404
    note = client.get(f"/api/notes/{n['id']}").json()
    ids = [x["id"] for x in client.get("/api/tasks").json()]
    if mode == "desvincular":
        assert t["id"] in ids and note["state"] == "activa" and note["project_id"] is None
        assert client.get("/api/recurrences").json()[0]["project_id"] is None
    else:
        assert ids == [otra["id"]] and note["state"] == "papelera" and not client.get("/api/recurrences").json()


# ---------------- 15-18) Notas ----------------
def test_filtrar_notas_por_titulo_contenido_y_proyecto(client):
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    a = client.post("/api/notes", json={"content": "Reunión Alfa\nventana de corte el sábado", "project_id": p}).json()
    b = client.post("/api/notes", json={"content": "Ideas\nalfa beta"}).json()

    def ids(q):
        return [n["id"] for n in client.get("/api/notes", params=q).json()]
    assert sorted(ids({"q": "alfa"})) == sorted([a["id"], b["id"]])
    assert ids({"q": "alfa", "in": "titulo"}) == [a["id"]]
    assert ids({"q": "SABADO", "in": "contenido"}) == [a["id"]]
    assert ids({"project_id": "none"}) == [b["id"]]
    assert ids({"project_id": str(p), "q": "corte"}) == [a["id"]]


def test_pestanas_con_pantalla_dividida_y_nota_purgada(client):
    a = client.post("/api/notes", json={}).json()["id"]
    b = client.post("/api/notes", json={}).json()["id"]
    client.put("/api/session/note-tabs", json={"open": [b, a], "active": a, "split": b})
    assert client.get("/api/session/note-tabs").json() == {"open": [b, a], "active": a, "split": b}
    client.patch(f"/api/notes/{b}", json={"state": "papelera"})
    client.delete(f"/api/notes/{b}")
    assert client.get("/api/session/note-tabs").json() == {"open": [a], "active": a}


# ---------------- Restauración de una exportación de la 0.2 ----------------
def test_restaurar_exportacion_del_esquema_anterior(client):
    mk(client, title="Antes")
    export = client.get("/api/export/full").json()
    assert export["schema_version"] == 3
    old = json.loads(json.dumps(export))
    old["schema_version"], old["app_version"] = 2, "0.2.0"
    for r in old["tables"]["recurrences"]:
        r.pop("template", None)
    old["tables"]["settings"] = [s for s in old["tables"]["settings"] if s["key"] != "work_schedule"] + [
        {"key": "workdays", "value": "[1,2,3]"}, {"key": "work_start", "value": "\"10:00\""}]
    assert client.post("/api/restore/preview", json=old).json()["schema_version"] == 2
    r = client.post("/api/restore", json={"data": old, "confirm": True})
    assert r.status_code == 200, r.text
    sch = client.get("/api/settings").json()["work_schedule"]
    assert sch["3"] == {"start": "10:00", "end": "18:00"} and sch["4"] is None
    assert [t["title"] for t in client.get("/api/tasks").json()] == ["Antes"]
    old["schema_version"] = 1
    assert client.post("/api/restore/preview", json=old).status_code == 422
