"""Acceptance-criteria tests (server side). Numbered as in the specification."""
from datetime import datetime, timedelta, timezone

from conftest import make_client


def mk_task(c, **kw):
    r = c.post("/api/tasks", json=kw)
    assert r.status_code == 201, r.text
    return r.json()


def me(c):
    return c.get("/api/bootstrap").json()["me_id"]


def person(c, name, **kw):
    r = c.post("/api/people", json={"name": name, **kw})
    assert r.status_code == 201, r.text
    return r.json()["id"]


def project(c, name, **kw):
    r = c.post("/api/projects", json={"name": name, **kw})
    assert r.status_code == 201, r.text
    return r.json()["id"]


def test_01_untitled_note_persists_and_restores_tabs(cfg, clock):
    with make_client(cfg, clock) as c:
        n = c.post("/api/notes", json={}).json()
        assert n["title_manual"] is None and n["project_id"] is None
        assert n["display_title"].startswith("Note of ")  # English by default (0.4)
        n2 = c.post("/api/notes", json={}).json()
        r = c.patch(f"/api/notes/{n['id']}", json={"content": "\n\n## Llamada con soporte\nrevisar logs", "base_version": n["version"]})
        assert r.status_code == 200 and r.json()["display_title"] == "Llamada con soporte"
        c.put("/api/session/note-tabs", json={"open": [n2["id"], n["id"]], "active": n["id"]})
    with make_client(cfg, clock) as c:
        assert c.get("/api/session/note-tabs").json() == {"open": [n2["id"], n["id"]], "active": n["id"]}
        assert c.get(f"/api/notes/{n['id']}").json()["content"] == "\n\n## Llamada con soporte\nrevisar logs"
        c.put("/api/session/note-tabs", json={"open": [n2["id"]], "active": n2["id"]})
        assert c.get(f"/api/notes/{n['id']}").json()["state"] == "activa"


def test_01b_manual_title_is_never_overwritten(client):
    n = client.post("/api/notes", json={}).json()
    client.patch(f"/api/notes/{n['id']}", json={"title_manual": "Mi título"})
    assert client.patch(f"/api/notes/{n['id']}", json={"content": "Otra primera línea"}).json()["display_title"] == "Mi título"
    assert client.patch(f"/api/notes/{n['id']}", json={"title_manual": ""}).json()["display_title"] == "Otra primera línea"


def test_02_version_conflict_keeps_the_text(client):
    n = client.post("/api/notes", json={"content": "versión A"}).json()
    assert client.patch(f"/api/notes/{n['id']}", json={"content": "versión B", "base_version": n["version"]}).status_code == 200
    stale = client.patch(f"/api/notes/{n['id']}", json={"content": "versión C", "base_version": n["version"]})
    assert stale.status_code == 409 and stale.json()["code"] == "conflicto_version"
    assert client.get(f"/api/notes/{n['id']}").json()["content"] == "versión B"
    assert client.patch(f"/api/notes/{n['id']}", json={"content": 123}).status_code == 422
    assert client.get(f"/api/notes/{n['id']}").json()["content"] == "versión B"


def test_03_task_with_title_only_and_later_assignment(client):
    t = mk_task(client, title="Revisar propuesta")
    assert t["assignee_id"] is None and t["project_id"] is None and t["due_date"] is None
    assert t["status"] == "pendiente" and t["priority"] == "normal"
    p = person(client, "Ana")
    t2 = client.patch(f"/api/tasks/{t['id']}", json={"assignee_id": p}).json()
    assert t2["assignee_id"] == p and any("Responsable" in h["text"] for h in t2["history"])
    assert client.post("/api/tasks", json={"title": "  "}).status_code == 422
    assert client.post("/api/tasks", json={}).status_code == 422


def test_04_person_in_several_projects(client):
    a = person(client, "Ana")
    p1, p2 = project(client, "P1"), project(client, "P2")
    for p in (p1, p2):
        assert client.post(f"/api/projects/{p}/people", json={"person_id": a}).status_code == 200
    client.post(f"/api/projects/{p1}/people", json={"person_id": a, "role": "líder"})
    assert len([x for x in client.get("/api/people").json() if x["name"] == "Ana"]) == 1
    assert sorted(x["name"] for x in client.get(f"/api/people/{a}/view").json()["projects"]) == ["P1", "P2"]


def test_05_backlog_with_due_date_in_today(client):
    t = mk_task(client, title="Idea con fecha", status="backlog", due_date="2026-10-14")
    today = client.get("/api/today").json()
    item = next(x for x in today["sections"]["vence"] if x["id"] == t["id"])
    assert "backlog" in item["signals"]
    assert client.get(f"/api/tasks/{t['id']}").json()["status"] == "backlog"
    assert t["id"] not in [x["id"] for x in client.get("/api/tasks").json()]
    assert t["id"] in [x["id"] for x in client.get("/api/tasks?include_backlog=1").json()]


def test_06_in_review_and_blocked(client):
    t = mk_task(client, title="Entregable", status="en_revision")
    r = client.patch(f"/api/tasks/{t['id']}", json={"condition": "bloqueada", "wait_on": "Cliente", "wait_reason": "Falta acceso"}).json()
    assert r["status"] == "en_revision" and r["condition"] == "bloqueada" and r["wait_since"]
    assert [(x["id"], x["status"]) for x in client.get("/api/tasks?condition=bloqueada").json()] == [(t["id"], "en_revision")]
    f = client.post(f"/api/tasks/{t['id']}/follow-up", json={"text": "Correo enviado"}).json()
    assert f["condition"] == "bloqueada" and f["last_follow_up_at"]
    r = client.patch(f"/api/tasks/{t['id']}", json={"condition": None}).json()
    assert r["status"] == "en_revision" and r["condition"] is None


def test_07_dependency_on_me_in_today(client):
    yo, otra = me(client), person(client, "Luis")
    mia = mk_task(client, title="Definir matriz", assignee_id=yo)
    suya = mk_task(client, title="Cargar matriz", assignee_id=otra)
    client.post(f"/api/tasks/{suya['id']}/dependencies", json={"depends_on_id": mia["id"]})
    item = next(x for x in client.get("/api/today").json()["sections"]["depende_de_mi"] if x["id"] == mia["id"])
    assert item["open_dependents"] == 1 and "bloquea_otras" in item["signals"]
    det = client.get(f"/api/tasks/{suya['id']}").json()
    assert det["blocked_by"][0]["id"] == mia["id"]
    assert any("«Definir matriz»" in h["text"] for h in det["history"])  # no numeric identifiers
    client.patch(f"/api/tasks/{mia['id']}", json={"status": "hecha"})
    assert client.get(f"/api/tasks/{suya['id']}").json()["status"] == "pendiente"


def test_08_circular_dependencies(client):
    a, b, c = (mk_task(client, title=x)["id"] for x in "ABC")
    assert client.post(f"/api/tasks/{a}/dependencies", json={"depends_on_id": a}).status_code == 422
    assert client.post(f"/api/tasks/{a}/dependencies", json={"depends_on_id": b}).status_code == 200
    assert client.post(f"/api/tasks/{b}/dependencies", json={"depends_on_id": a}).json()["code"] == "ciclo"
    assert client.post(f"/api/tasks/{b}/dependencies", json={"depends_on_id": c}).status_code == 200
    r = client.post(f"/api/tasks/{c}/dependencies", json={"depends_on_id": a})
    assert r.status_code == 422 and r.json()["code"] == "ciclo"
    assert client.patch(f"/api/tasks/{a}", json={"parent_id": b}).status_code == 200
    assert client.patch(f"/api/tasks/{b}", json={"parent_id": a}).status_code == 422


def test_09_no_hours_worked(client):
    t = mk_task(client, title="X", status="en_curso")
    assert t["started_at"]
    keys = " ".join(t.keys()).lower()
    assert "worked" not in keys and "trabajad" not in keys and "dedicacion" not in keys


def test_10_opening_does_not_reset_follow_up(client):
    t = mk_task(client, title="Seguimiento", review_after_idle_hours=24)
    before = client.get(f"/api/tasks/{t['id']}").json()
    for _ in range(3):
        client.get(f"/api/tasks/{t['id']}")
    client.get("/api/today")
    client.post(f"/api/tasks/{t['id']}/reorder", json={"after_id": t["id"]})
    client.patch(f"/api/tasks/{t['id']}", json={"priority": "alta"})
    client.patch(f"/api/tasks/{t['id']}", json={"description": before["description"]})
    assert client.get(f"/api/tasks/{t['id']}").json()["last_significant_update"] == before["last_significant_update"]


def test_10b_significant_change_does_reset(client, clock):
    t = mk_task(client, title="S")
    clock.dt += timedelta(minutes=5)
    assert client.patch(f"/api/tasks/{t['id']}", json={"status": "en_curso"}).json()["last_significant_update"] > t["last_significant_update"]


def test_11_reminder_without_duplicates(cfg, clock):
    with make_client(cfg, clock) as c:
        t = mk_task(c, title="Entrega", due_date="2026-10-14")
        assert len([r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t["id"]]) == 1
    with make_client(cfg, clock) as c:
        c.get("/api/today")
        mine = [r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t["id"]]
        assert len(mine) == 1
        c.post(f"/api/reminders/{mine[0]['id']}/action", json={"action": "descartar"})
    with make_client(cfg, clock) as c:
        assert not [r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t["id"]]
        t2 = mk_task(c, title="Hecha", due_date="2026-10-13", status="hecha")
        assert not [r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t2["id"]]


def test_11b_recurring_follow_up_without_avalanche(cfg, clock):
    with make_client(cfg, clock) as c:
        t = mk_task(c, title="Esperando cliente", condition="espera", follow_up_every_days=2, wait_since="2026-09-01T08:00:00Z")
        act = [r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t["id"]]
        assert len(act) == 1
        c.post(f"/api/tasks/{t['id']}/follow-up", json={})
        act = [r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t["id"]]
        assert len(act) == 1
        c.post(f"/api/reminders/{act[0]['id']}/action", json={"action": "atendido"})
        assert not [r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t["id"]]
    clock.dt += timedelta(days=2, hours=1)
    with make_client(cfg, clock) as c:
        assert len([r for r in c.get("/api/reminders").json()["active"] if r["task_id"] == t["id"]]) == 1


def test_11c_snooze(client, clock):
    t = mk_task(client, title="Revisar", next_review_at="2026-10-13T09:00:00Z")
    r = [x for x in client.get("/api/reminders").json()["active"] if x["task_id"] == t["id"]][0]
    client.post(f"/api/reminders/{r['id']}/action", json={"action": "posponer", "until": "2026-10-13T12:00:00Z"})
    assert not [x for x in client.get("/api/reminders").json()["active"] if x["task_id"] == t["id"]]
    clock.dt = datetime(2026, 10, 13, 12, 30, tzinfo=timezone.utc)
    assert [x for x in client.get("/api/reminders").json()["active"] if x["task_id"] == t["id"]]


def test_12_recurrences(cfg, clock):
    with make_client(cfg, clock) as c:
        r = c.post("/api/recurrences", json={"title": "Parte diario", "rule": "laborables", "start_date": "2026-10-12"}).json()
        occ = c.get(f"/api/tasks?recurrence_id={r['id']}&include_closed=1").json()
        assert sorted(x["occurrence_date"] for x in occ) == ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15", "2026-10-16", "2026-10-19", "2026-10-20"]
        first = next(x for x in occ if x["occurrence_date"] == "2026-10-13")
        c.patch(f"/api/tasks/{first['id']}", json={"status": "hecha"})
        skip = next(x for x in occ if x["occurrence_date"] == "2026-10-14")
        assert c.post(f"/api/tasks/{skip['id']}/skip").json()["status"] == "cancelada"
    with make_client(cfg, clock) as c:
        c.get("/api/today")
        assert len(c.get(f"/api/tasks?recurrence_id={r['id']}&include_closed=1").json()) == len(occ)
        assert c.get(f"/api/tasks/{first['id']}").json()["status"] == "hecha"
    clock.dt = datetime(2026, 12, 1, 10, tzinfo=timezone.utc)
    with make_client(cfg, clock) as c:
        c.get("/api/today")
        new = sorted(x["occurrence_date"] for x in c.get(f"/api/tasks?recurrence_id={r['id']}&include_closed=1").json() if x["occurrence_date"] > "2026-10-20")
        assert new[0] == "2026-11-30" and len(new) <= 7
        c.patch(f"/api/recurrences/{r['id']}", json={"title": "Parte diario v2", "apply_to_future": True})
        assert c.get(f"/api/tasks/{first['id']}").json()["title"] == "Parte diario"
        fut = [x for x in c.get(f"/api/tasks?recurrence_id={r['id']}").json() if x["occurrence_date"] >= "2026-12-01"]
        assert fut and all(x["title"] == "Parte diario v2" for x in fut)


def test_12b_weekly_recurrence_holiday(client):
    client.post("/api/holidays", json={"date": "2026-10-14"})
    r = client.post("/api/recurrences", json={"title": "Semanal", "rule": "semanal", "weekdays": [3],
                                              "start_date": "2026-10-13", "non_working": "siguiente_laborable"}).json()
    o = next(x for x in client.get(f"/api/tasks?recurrence_id={r['id']}").json() if x["occurrence_date"] == "2026-10-14")
    assert o["due_date"] == "2026-10-15"


def test_13_planning_estimates(client):
    a = person(client, "Ana", weekly_capacity_hours=40)
    sin = mk_task(client, title="Sin estimar", assignee_id=a, planned_date="2026-10-14")
    pa = next(p for p in client.get("/api/planning?week=2026-10-13").json()["people"] if p["person_id"] == a)
    assert pa["counted_hours"] is None and [t["id"] for t in pa["unestimated"]] == [sin["id"]]
    padre = mk_task(client, title="Padre", assignee_id=a, planned_date="2026-10-14", estimate_hours=10)
    mk_task(client, title="Hija 1", assignee_id=a, planned_date="2026-10-15", estimate_hours=3, parent_id=padre["id"])
    mk_task(client, title="Hija 2", assignee_id=a, planned_date="2026-10-15", estimate_hours=2, parent_id=padre["id"])
    otra = mk_task(client, title="Grande", assignee_id=a, planned_date="2026-10-16", estimate_hours=30)
    client.put(f"/api/tasks/{otra['id']}/allocations", json={"week_start": "2026-10-12", "hours": 8})
    pa = next(p for p in client.get("/api/planning?week=2026-10-13").json()["people"] if p["person_id"] == a)
    assert pa["counted_hours"] == 3 + 2 + 8
    assert [t["id"] for t in pa["split_into_subtasks"]] == [padre["id"]]
    assert pa["capacity_hours"] == 40
    assert next(p for p in client.get("/api/planning?week=2026-10-20").json()["people"] if p["person_id"] == a)["counted_hours"] is None
    assert client.put(f"/api/tasks/{otra['id']}/allocations", json={"week_start": "2026-10-13", "hours": 1}).status_code == 422


def test_14_absences(client):
    a = person(client, "Ana")
    t = mk_task(client, title="Taller", assignee_id=a, planned_date="2026-10-15")
    assert client.post("/api/absences", json={"person_id": a, "start_date": "2026-10-15", "end_date": "2026-10-16"}).status_code == 201
    assert client.post("/api/absences", json={"person_id": a, "start_date": "2026-10-16", "end_date": "2026-10-15"}).status_code == 422
    pa = next(p for p in client.get("/api/planning?week=2026-10-12").json()["people"] if p["person_id"] == a)
    assert pa["conflicts"][0]["task_id"] == t["id"] and pa["conflicts"][0]["reason"] == "ausencia"
    assert pa["capacity_hours"] is None and pa["availability"]["available_hours"] is None
    assert client.get(f"/api/tasks/{t['id']}").json()["assignee_id"] == a
    row = next(x for x in client.get("/api/today").json()["team"] if x["person_id"] == a)
    assert row["absences"] and set(row) == {"person_id", "name", "is_me", "active", "in_review", "blocked",
                                            "due_this_week", "absences", "holidays"}


def test_15_note_to_task(client):
    p = project(client, "Alfa")
    n = client.post("/api/notes", json={"content": "Acta\n- enviar plantilla de roles al cliente\n- otro punto", "project_id": p}).json()
    t = client.post(f"/api/notes/{n['id']}/to-task", json={"title": "Enviar plantilla de roles", "excerpt": "enviar plantilla de roles al cliente"}).json()
    assert t["project_id"] == p
    assert t["notes"][0]["id"] == n["id"] and t["notes"][0]["excerpt"] == "enviar plantilla de roles al cliente"
    nd = client.get(f"/api/notes/{n['id']}").json()
    assert nd["content"] == n["content"] and nd["tasks"][0]["id"] == t["id"] and t["description"] == ""


def test_16_content_search(client):
    n = client.post("/api/notes", json={"content": "apuntes\nla ventana de corte será el sábado por la noche"}).json()
    hit = next(x for x in client.get("/api/search", params={"q": '"ventana de corte"'}).json()["results"] if x["type"] == "nota")
    assert hit["id"] == n["id"] and "ventana de corte" in hit["snippet"] and hit["title"] == "apuntes"
    assert client.get("/api/search", params={"q": "SÁBADO noche"}).json()["results"]
    client.patch(f"/api/notes/{n['id']}", json={"state": "papelera"})
    assert not client.get("/api/search", params={"q": "ventana de corte"}).json()["results"]
    assert client.get("/api/search", params={"q": "ventana de corte", "trash": "true"}).json()["results"]
    client.patch(f"/api/notes/{n['id']}", json={"state": "activa"})
    assert client.get("/api/search", params={"q": "ventana de corte"}).json()["results"]


def test_17_views_without_duplicates(client):
    t = mk_task(client, title="Única", due_date="2026-10-15", planned_date="2026-10-14", next_review_at="2026-10-16T08:00:00Z")
    assert [x["id"] for x in client.get("/api/tasks").json()].count(t["id"]) == 1
    assert [x["id"] for x in client.get("/api/tasks?date_from=2026-10-12&date_to=2026-10-18").json()].count(t["id"]) == 1
    client.post(f"/api/tasks/{t['id']}/reorder", json={"status": "en_curso"})
    assert len(client.get("/api/tasks?include_backlog=1&include_closed=1&include_archived=1").json()) == 1


def test_18_export_restore(client, cfg):
    p, a = project(client, "Alfa"), person(client, "Ana")
    client.post(f"/api/projects/{p}/people", json={"person_id": a, "dedication_pct": 50})
    t1 = mk_task(client, title="A", project_id=p, assignee_id=a, tags=["cliente"])
    t2 = mk_task(client, title="B", project_id=p)
    client.post(f"/api/tasks/{t1['id']}/steps", json={"text": "paso uno"})
    client.post(f"/api/tasks/{t2['id']}/dependencies", json={"depends_on_id": t1["id"]})
    n = client.post("/api/notes", json={"content": "nota importante"}).json()
    client.post(f"/api/notes/{n['id']}/links", json={"task_id": t1["id"]})
    loc = client.post("/api/locations", json={"name": "Norte"}).json()
    client.post("/api/holidays", json={"date": "2026-12-08", "location_id": loc["id"]})
    client.patch("/api/settings", json={"start_view": "notas", "due_soon_days": 5})
    client.put("/api/session/note-tabs", json={"open": [n["id"]], "active": n["id"]})
    export = client.get("/api/export/full").json()
    assert export["format"] == "kaosnt" and export["format_version"] == 1
    client.patch(f"/api/notes/{n['id']}", json={"content": "modificada"})
    mk_task(client, title="C")
    client.patch("/api/settings", json={"start_view": "hoy"})
    prev = client.post("/api/restore/preview", json=export).json()
    assert prev["incoming"]["tasks"] == 2 and prev["current"]["tasks"] == 3
    assert client.post("/api/restore", json={"data": export}).status_code == 422
    r = client.post("/api/restore", json={"data": export, "confirm": True}).json()
    assert (cfg.backup_dir / r["previous_backup"]).exists()
    assert client.get(f"/api/notes/{n['id']}").json()["content"] == "nota importante"
    d1 = client.get(f"/api/tasks/{t1['id']}").json()
    assert client.get(f"/api/tasks/{t2['id']}").json()["blocked_by"][0]["id"] == t1["id"]
    assert d1["tags"] == ["cliente"] and d1["notes"][0]["id"] == n["id"] and d1["steps"][0]["text"] == "paso uno"
    s = client.get("/api/settings").json()
    assert s["start_view"] == "notas" and s["due_soon_days"] == 5
    assert client.get("/api/session/note-tabs").json()["open"] == [n["id"]]
    assert client.get("/api/holidays").json()[0]["location_id"] == loc["id"]
    assert client.get(f"/api/projects/{p}").json()["people"][0]["dedication_pct"] == 50


def test_18b_restore_rejects_invalid_data(client):
    assert client.post("/api/restore/preview", json={"format": "otro"}).status_code == 422
    export = client.get("/api/export/full").json()
    broken = {**export, "tables": {**export["tables"], "task_dependencies": [{"task_id": 99, "depends_on_id": 98}]}}
    mk_task(client, title="Se conserva")
    r = client.post("/api/restore", json={"data": broken, "confirm": True})
    assert r.status_code == 422 and "relaciones" in r.json()["message"]
    assert [t["title"] for t in client.get("/api/tasks").json()] == ["Se conserva"]
    assert client.post("/api/restore/preview", json={**export, "tables": {**export["tables"], "notes": [{"id": 1, "hack": 1}]}}).status_code == 422
    proj = client.post("/api/projects", json={"name": "P"}).json()
    assert client.post("/api/restore/preview", json=client.get(f"/api/export/project/{proj['id']}").json()).status_code == 422


def test_18c_backup_and_restore_from_backup(client):
    mk_task(client, title="Antes")
    name = client.post("/api/backups").json()["name"]
    assert name.startswith("kaosnt-")
    mk_task(client, title="Después")
    assert client.post(f"/api/backups/{name}/restore").json()["previous_backup"]
    assert [t["title"] for t in client.get("/api/tasks").json()] == ["Antes"]
    assert client.post("/api/backups/malicioso.db/restore").status_code == 422
    assert client.post("/api/backups/..%2F..%2Fx.db/restore").status_code in (404, 405, 422)
    assert {i["reason"] for i in client.get("/api/backups").json()["items"]} >= {"manual", "previa-restauracion"}
