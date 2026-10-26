"""Tests for the features added in 0.5."""
from datetime import timedelta


def mk(c, **kw):
    r = c.post("/api/tasks", json=kw)
    assert r.status_code == 201, r.text
    return r.json()


def ids(c, q):
    return sorted(t["id"] for t in c.get("/api/tasks" + q).json())


def series(client, **kw):
    """A daily series starting on 13/10/2026 (the test clock) with several occurrences."""
    client.patch("/api/settings", json={"recurrence_horizon_days": 5})
    t = mk(client, title="Daily", due_date="2026-10-13", **kw)
    rec = client.post(f"/api/tasks/{t['id']}/recurrence", json={"rule": "diaria"}).json()["recurrence_id"]
    occ = sorted(client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json(), key=lambda x: x["occurrence_date"])
    return rec, occ


# ---------------- 4/5) Multi-value filters and client filter ----------------
def test_multi_value_filters_and_client(client):
    c1 = client.post("/api/clients", json={"name": "C1"}).json()["id"]
    c2 = client.post("/api/clients", json={"name": "C2"}).json()["id"]
    p1 = client.post("/api/projects", json={"name": "P1", "client_id": c1}).json()["id"]
    p2 = client.post("/api/projects", json={"name": "P2", "client_id": c2}).json()["id"]
    p3 = client.post("/api/projects", json={"name": "P3"}).json()["id"]
    ana = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    a = mk(client, title="A", project_id=p1, assignee_id=ana, tags=["x"])["id"]
    b = mk(client, title="B", project_id=p2, priority="alta", tags=["y"])["id"]
    c = mk(client, title="C", project_id=p3, condition="espera")["id"]
    d = mk(client, title="D")["id"]
    assert ids(client, f"?project_id={p1},{p2}") == sorted([a, b])
    assert ids(client, f"?project_id={p1},none") == sorted([a, d])
    assert ids(client, f"?project_id={p1}") == [a]  # single value keeps working
    assert ids(client, f"?client_id={c1},{c2}") == sorted([a, b])
    assert ids(client, "?client_id=none") == sorted([c, d])  # project without client + no project
    assert ids(client, f"?client_id={c1},none&project_id={p1},{p3}") == sorted([a, c])  # AND between filters
    assert ids(client, f"?person_id={ana},none") == sorted([a, b, c, d])
    assert ids(client, "?person_id=none") == sorted([b, c, d])
    assert ids(client, "?tag=x,Y") == sorted([a, b])
    assert ids(client, "?priority=alta,urgente") == [b]
    assert ids(client, "?condition=espera,none") == sorted([a, b, c, d])
    assert ids(client, "?condition=bloqueada") == []
    assert ids(client, "?project_id=abc") == sorted([a, b, c, d])  # invalid values are ignored
    assert [p["name"] for p in client.get(f"/api/projects?client_id={c1},none").json()] == ["P1", "P3"]


def test_notes_multi_value_filters_and_client(client):
    c1 = client.post("/api/clients", json={"name": "C1"}).json()["id"]
    p1 = client.post("/api/projects", json={"name": "P1", "client_id": c1}).json()["id"]
    p2 = client.post("/api/projects", json={"name": "P2"}).json()["id"]
    n1 = client.post("/api/notes", json={"content": "a", "project_id": p1, "kind": "acta"}).json()["id"]
    n2 = client.post("/api/notes", json={"content": "b", "project_id": p2, "kind": "decision"}).json()["id"]
    n3 = client.post("/api/notes", json={"content": "c"}).json()["id"]

    def nids(q):
        return sorted(n["id"] for n in client.get("/api/notes?scope=todas&" + q).json())
    assert nids(f"project_id={p1},{p2}") == sorted([n1, n2])
    assert nids(f"project_id={p2},none") == sorted([n2, n3])
    assert nids(f"client_id={c1}") == [n1]
    assert nids("client_id=none") == sorted([n2, n3])
    assert nids("kind=acta,none") == sorted([n1, n3])


# ---------------- 1) Kanban: move between groups ----------------
def test_move_between_groups_with_status_and_undo(client):
    ana = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    p1 = client.post("/api/projects", json={"name": "P1"}).json()["id"]
    p2 = client.post("/api/projects", json={"name": "P2"}).json()["id"]
    g1 = client.post(f"/api/projects/{p1}/groupings", json={"kind": "linea", "name": "L1"}).json()["id"]
    g2 = client.post(f"/api/projects/{p2}/groupings", json={"kind": "linea", "name": "L2"}).json()["id"]
    t = mk(client, title="T", project_id=p1, workstream_id=g1)
    r = client.post(f"/api/tasks/{t['id']}/reorder?undo=1", json={"status": "en_curso", "group": {"field": "assignee_id", "value": ana}}).json()
    assert r["status"] == "en_curso" and r["assignee_id"] == ana and r["undo_id"]
    client.post(f"/api/undo/{r['undo_id']}")
    back = client.get(f"/api/tasks/{t['id']}").json()
    assert back["status"] == "pendiente" and back["assignee_id"] is None
    # changing project drops the groupings of the old project
    r = client.post(f"/api/tasks/{t['id']}/reorder", json={"group": {"field": "project_id", "value": p2}}).json()
    assert r["project_id"] == p2 and r["workstream_id"] is None
    # a grouping of another project is rejected and nothing changes
    bad = client.post(f"/api/tasks/{t['id']}/reorder", json={"status": "en_revision", "group": {"field": "workstream_id", "value": g1}})
    assert bad.status_code == 422 and bad.json()["message_key"] == "La agrupación pertenece a otro proyecto"
    assert client.get(f"/api/tasks/{t['id']}").json()["status"] == "pendiente"
    assert client.post(f"/api/tasks/{t['id']}/reorder", json={"group": {"field": "workstream_id", "value": g2}}).json()["workstream_id"] == g2
    assert client.post(f"/api/tasks/{t['id']}/reorder", json={"group": {"field": "workstream_id", "value": None}}).json()["workstream_id"] is None
    assert client.post(f"/api/tasks/{t['id']}/reorder", json={"group": {"field": "status", "value": 1}}).status_code == 422


def test_move_between_groups_respects_pending_approval(client):
    ana = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    t = mk(client, title="T", approval="pendiente")
    r = client.post(f"/api/tasks/{t['id']}/reorder", json={"status": "en_curso", "group": {"field": "assignee_id", "value": ana}})
    assert r.status_code == 409 and r.json()["code"] == "aprobacion_pendiente"
    assert client.get(f"/api/tasks/{t['id']}").json()["assignee_id"] is None  # nothing applied
    r = client.post(f"/api/tasks/{t['id']}/reorder", json={"status": "en_curso", "force": True, "group": {"field": "assignee_id", "value": ana}})
    assert r.json()["assignee_id"] == ana


def test_move_recurring_occurrence_between_groups_with_scope(client):
    ana = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    rec, occ = series(client)
    mid = occ[2]
    r = client.post(f"/api/tasks/{mid['id']}/reorder", json={"status": "en_curso", "group": {"field": "assignee_id", "value": ana}, "scope": "following"}).json()
    assert r["undo_id"]  # several tasks changed → always undoable
    after = {x["id"]: x for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()}
    assert [after[o["id"]]["assignee_id"] for o in occ] == [None, None] + [ana] * (len(occ) - 2)
    assert [after[o["id"]]["status"] for o in occ].count("en_curso") == 1  # status only for the dragged one
    assert next(x for x in client.get("/api/recurrences").json() if x["id"] == rec)["assignee_id"] == ana
    client.post(f"/api/undo/{r['undo_id']}")
    again = client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()
    assert all(x["assignee_id"] is None for x in again) and all(x["status"] == "pendiente" for x in again)


# ---------------- 2) Scope of changes on recurring tasks ----------------
def test_scope_this_following_all(client):
    luis = client.post("/api/people", json={"name": "Luis"}).json()["id"]
    rec, occ = series(client)
    client.patch(f"/api/tasks/{occ[0]['id']}", json={"status": "hecha"})
    due_before = {o["id"]: o["due_date"] for o in occ}
    # only this one
    client.patch(f"/api/tasks/{occ[2]['id']}?scope=this", json={"priority": "alta"})
    pr = {x["id"]: x["priority"] for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()}
    assert [pr[o["id"]] for o in occ].count("alta") == 1
    assert next(x for x in client.get("/api/recurrences").json() if x["id"] == rec)["priority"] == "normal"
    # this and the following ones
    r = client.patch(f"/api/tasks/{occ[2]['id']}?scope=following", json={"title": "Daily v2", "assignee_id": luis, "status": "en_curso"}).json()
    assert r["updated_occurrences"] == len(occ) - 3 and r["undo_id"]
    now = {x["id"]: x for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()}
    assert [now[o["id"]]["title"] for o in occ] == ["Daily", "Daily"] + ["Daily v2"] * (len(occ) - 2)
    assert [now[o["id"]]["status"] for o in occ].count("en_curso") == 1  # status is never propagated
    assert all(now[o["id"]]["due_date"] == due_before[o["id"]] for o in occ)  # due dates neither
    series_row = next(x for x in client.get("/api/recurrences").json() if x["id"] == rec)
    assert series_row["title"] == "Daily v2" and series_row["assignee_id"] == luis and series_row["template"]["assignee_id"] == luis
    # all, including the finished one
    r = client.patch(f"/api/tasks/{occ[3]['id']}?scope=all", json={"tags": ["serie"], "estimate_hours": 2}).json()
    assert r["updated_occurrences"] == len(occ) - 1
    now = {x["id"]: x for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()}
    assert all(now[o["id"]]["tags"] == ["serie"] and now[o["id"]]["estimate_hours"] == 2 for o in occ)
    assert now[occ[0]["id"]]["status"] == "hecha"
    # undo reverts every occurrence at once
    client.post(f"/api/undo/{r['undo_id']}")
    now = {x["id"]: x for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()}
    assert all(now[o["id"]]["estimate_hours"] is None for o in occ)
    assert client.patch(f"/api/tasks/{occ[3]['id']}?scope=nope", json={"priority": "baja"}).status_code == 422


def test_scope_shifts_planned_date_and_new_occurrences_inherit(client, clock):
    rec, occ = series(client)
    client.patch(f"/api/tasks/{occ[1]['id']}?scope=following", json={"planned_date": occ[1]["due_date"][:8] + str(int(occ[1]["due_date"][8:]) - 1).zfill(2)})
    now = {x["id"]: x for x in client.get(f"/api/tasks?recurrence_id={rec}").json()}
    for o in occ[1:]:
        assert now[o["id"]]["planned_date"] < now[o["id"]]["due_date"]  # one day before its own due date
    clock.dt += timedelta(days=10)
    client.get("/api/today")
    newest = max(client.get(f"/api/tasks?recurrence_id={rec}").json(), key=lambda x: x["occurrence_date"])
    assert newest["planned_date"] < newest["due_date"]


def test_scope_on_non_recurring_task_is_ignored(client):
    t = mk(client, title="Solo")
    r = client.patch(f"/api/tasks/{t['id']}?scope=all", json={"priority": "alta"}).json()
    assert r["priority"] == "alta" and r["updated_occurrences"] == 0 and "undo_id" not in r


def test_series_manager_scopes(client):
    rec, occ = series(client)
    client.patch(f"/api/tasks/{occ[0]['id']}", json={"status": "hecha"})
    client.patch(f"/api/recurrences/{rec}", json={"priority": "alta", "scope": "new"})
    pr = [x["priority"] for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()]
    assert set(pr) == {"normal"}
    client.patch(f"/api/recurrences/{rec}", json={"priority": "urgente", "scope": "from_today"})
    now = {x["id"]: x["priority"] for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()}
    assert now[occ[0]["id"]] == "normal" and now[occ[1]["id"]] == "urgente"
    client.patch(f"/api/recurrences/{rec}", json={"priority": "baja", "scope": "all"})
    assert {x["priority"] for x in client.get(f"/api/tasks?recurrence_id={rec}&include_closed=1").json()} == {"baja"}
    client.patch(f"/api/recurrences/{rec}", json={"estimate_hours": 3, "apply_to_future": True})  # 0.4 clients
    assert client.get(f"/api/tasks/{occ[1]['id']}").json()["estimate_hours"] == 3
    assert client.patch(f"/api/recurrences/{rec}", json={"scope": "otro"}).status_code == 422


# ---------------- Settings ----------------
def test_new_settings(client):
    s = client.get("/api/settings").json()
    assert s["group_subtasks"] is True and s["note_editor_mode"] == "editar"
    assert client.patch("/api/settings", json={"group_subtasks": False, "note_editor_mode": "vista_previa"}).status_code == 200
    assert client.patch("/api/settings", json={"note_editor_mode": "wysiwyg"}).status_code == 422  # «live» is valid since 0.6
    assert client.patch("/api/settings", json={"group_subtasks": "si"}).status_code == 422
