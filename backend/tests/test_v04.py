"""Tests for the features added in 0.4."""
import re
import sqlite3
from pathlib import Path

from fastapi.testclient import TestClient

from kaosnt import errors
from kaosnt.app import create_app
from kaosnt.config import Config
from kaosnt.db import MIGRATIONS_DIR, split_sql

SRC = Path(__file__).resolve().parents[1] / "kaosnt"


def mk(c, **kw):
    r = c.post("/api/tasks", json=kw)
    assert r.status_code == 201, r.text
    return r.json()


# ---------------- Delete team members ----------------
def _team(client):
    ana = client.post("/api/people", json={"name": "Ana", "weekly_capacity_hours": 40}).json()["id"]
    luis = client.post("/api/people", json={"name": "Luis"}).json()["id"]
    p = client.post("/api/projects", json={"name": "P"}).json()["id"]
    client.post(f"/api/projects/{p}/people", json={"person_id": ana, "dedication_pct": 50})
    client.post("/api/absences", json={"person_id": ana, "start_date": "2026-10-20", "end_date": "2026-10-21"})
    open_t = mk(client, title="Abierta", assignee_id=ana, project_id=p)
    done_t = mk(client, title="Hecha", assignee_id=ana, status="hecha")
    rev_t = mk(client, title="Revisa Ana", reviewer_id=ana, wait_on_person_id=ana)
    tpl_t = mk(client, title="Serie", assignee_id=ana, reviewer_id=ana, due_date="2026-10-13")
    rec = client.post(f"/api/tasks/{tpl_t['id']}/recurrence", json={"rule": "semanal", "weekdays": [2]}).json()["recurrence_id"]
    return ana, luis, p, open_t, done_t, rev_t, rec


def test_delete_person_preview_and_leave_unassigned(client, cfg):
    ana, luis, p, open_t, done_t, rev_t, rec = _team(client)
    pre = client.get(f"/api/people/{ana}/delete-preview").json()
    assert pre["open_tasks"] >= 2 and pre["closed_tasks"] == 1 and pre["review_tasks"] >= 2 and pre["waiting_tasks"] == 1
    assert pre["recurrences"] == 1 and pre["absences"] == 1 and pre["projects"] == 1 and not pre["is_me"]
    assert client.post(f"/api/people/{ana}/delete", json={}).status_code == 422  # explicit confirmation required
    r = client.post(f"/api/people/{ana}/delete", json={"confirm": True}).json()
    assert r["reassigned"] == 0 and (cfg.backup_dir / r["previous_backup"]).exists()
    assert r["previous_backup"].endswith("-previa-borrado.db")
    assert all(x["id"] != ana for x in client.get("/api/people").json())
    for tid in (open_t["id"], done_t["id"], rev_t["id"]):
        t = client.get(f"/api/tasks/{tid}").json()
        assert t["assignee_id"] is None and t["reviewer_id"] is None and t["wait_on_person_id"] is None
        assert any("Persona eliminada del equipo: Ana" in h["text"] for h in t["history"])
    recs = client.get("/api/recurrences").json()
    assert recs[0]["assignee_id"] is None and recs[0]["template"]["assignee_id"] is None and recs[0]["template"]["reviewer_id"] is None
    assert client.get(f"/api/projects/{p}").json()["people"] == []
    assert client.get("/api/absences").json() == []
    assert client.get("/api/today").status_code == 200 and client.get("/api/planning").status_code == 200


def test_delete_person_reassigning_open_work(client):
    ana, luis, p, open_t, done_t, rev_t, rec = _team(client)
    r = client.post(f"/api/people/{ana}/delete", json={"confirm": True, "reassign_to": luis}).json()
    assert r["reassigned"] >= 2 and r["reassigned_to"] == luis
    assert client.get(f"/api/tasks/{open_t['id']}").json()["assignee_id"] == luis
    assert client.get(f"/api/tasks/{done_t['id']}").json()["assignee_id"] is None  # closed tasks are not reassigned
    rec_ = client.get("/api/recurrences").json()[0]
    assert rec_["assignee_id"] == luis and rec_["template"]["assignee_id"] == luis and rec_["template"]["reviewer_id"] is None


def test_delete_person_rules(client):
    me = next(x for x in client.get("/api/people").json() if x["is_me"])["id"]
    r = client.post(f"/api/people/{me}/delete", json={"confirm": True})
    assert r.status_code == 422 and r.json()["code"] == "es_yo"
    assert client.get(f"/api/people/{me}/delete-preview").json()["is_me"]
    ana = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    assert client.post(f"/api/people/{ana}/delete", json={"confirm": True, "reassign_to": ana}).status_code == 422
    assert client.post(f"/api/people/{ana}/delete", json={"confirm": True, "reassign_to": 999}).status_code == 422
    nf = client.post("/api/people/999/delete", json={"confirm": True})
    assert nf.status_code == 404 and nf.json()["message_key"] == "{entidad} no encontrado"
    assert nf.json()["params"] == {"entidad": "Persona"} and nf.json()["tparams"] == ["entidad"]
    assert client.get("/api/backups").json()["items"] == []  # no backup when nothing was deleted


# ---------------- Resizable task panel ----------------
def test_task_panel_width_setting(client):
    assert client.get("/api/settings").json()["task_panel_width"] is None
    for bad in (100, 5000, "600", 600.5, True):
        assert client.patch("/api/settings", json={"task_panel_width": bad}).status_code == 422, bad
    assert client.patch("/api/settings", json={"task_panel_width": 640}).json()["task_panel_width"] == 640
    assert client.patch("/api/settings", json={"task_panel_width": None}).json()["task_panel_width"] is None


# ---------------- Default language and translatable server messages ----------------
def test_new_install_defaults_to_english_and_me(client):
    assert client.get("/api/settings").json()["language"] == "en"
    assert [p["name"] for p in client.get("/api/people").json() if p["is_me"]] == ["Me"]


def test_existing_database_keeps_spanish(tmp_path, clock):
    """A database created by 0.3 (schema 3) keeps the Spanish interface after migrating to 0.4."""
    cfg = Config(data_dir=tmp_path / "d", port=8765)
    cfg.data_dir.mkdir(parents=True)
    conn = sqlite3.connect(str(cfg.db_path))
    for f in ("001_initial.sql", "002_v02.sql", "003_v03.sql"):
        for stmt in split_sql((MIGRATIONS_DIR / f).read_text(encoding="utf-8")):
            conn.execute(stmt)
    conn.execute("PRAGMA user_version = 3")
    conn.execute("INSERT INTO people(name, is_me, created_at, updated_at) VALUES ('Yo', 1, 'x', 'x')")
    conn.commit()
    conn.close()
    with TestClient(create_app(cfg, clock=clock, background=False, extra_hosts=("testserver",))) as c:
        assert c.get("/api/settings").json()["language"] == "es"
        assert [p["name"] for p in c.get("/api/people").json()] == ["Yo"]
    assert list(cfg.backup_dir.glob("*-previa-migracion.db"))


def test_reset_keeps_the_interface_language(client):
    client.patch("/api/settings", json={"language": "es", "app_name": "Mío"})
    client.post("/api/system/reset", json={"confirm_text": "mío"})
    s = client.get("/api/settings").json()
    assert s["language"] == "es" and s["app_name"] == "KAOSnt"  # the rest of the settings are reset
    assert [p["name"] for p in client.get("/api/people").json()] == ["Yo"]
    client.patch("/api/settings", json={"language": "en"})
    client.post("/api/system/reset", json={"confirm_text": "BORRAR TODO"})
    assert [p["name"] for p in client.get("/api/people").json()] == ["Me"]


def test_restore_03_export_keeps_spanish(client):
    mk(client, title="A")
    data = client.get("/api/export/full").json()
    assert data["schema_version"] == 4
    data["schema_version"] = 3
    data["tables"]["settings"] = [x for x in data["tables"]["settings"] if x["key"] != "language"]
    assert client.post("/api/restore", json={"data": data, "confirm": True}).status_code == 200
    assert client.get("/api/settings").json()["language"] == "es"


def test_error_messages_are_translation_keys(client):
    r = client.patch("/api/settings", json={"task_panel_width": 1}).json()
    assert r["message_key"] == "El ancho del panel debe estar entre {min} y {max} píxeles"
    assert r["params"] == {"min": 320, "max": 2000} and r["message"] == "El ancho del panel debe estar entre 320 y 2000 píxeles"
    r = client.post("/api/tasks", json={"title": "x", "project_id": 99}).json()
    assert r["message_key"] == "{entidad} no existe" and r["params"] == {"entidad": "Proyecto"}
    v = client.post("/api/tasks", json={"title": "x", "nope": 1}).json()
    assert v["code"] == "validacion" and v["message_key"] == "Datos no válidos. {detalle}"


def test_entity_labels_and_no_fstring_messages():
    """Entity names passed to not_found/missing_ref are known keys; messages are never f-strings."""
    code = "\n".join(p.read_text(encoding="utf-8") for p in SRC.glob("*.py"))
    used = set(re.findall(r'(?:not_found|missing_ref)\(\s*"([^"]+)"\s*\)', code))
    used |= set(re.findall(r'exists\(conn, "\w+", [^,()]+(?:\([^)]*\))?, "([^"]+)"\)', code))
    used |= set(re.findall(r'\("\w+_id", "\w+", "([^"_]+)"\)', code))  # (field, table, label) tuples
    used |= set(re.findall(r'patch_simple\([^\n]*, "([^"]+)"(?:, stamp=\w+)?\)', code))
    assert used and used <= set(errors.ENTITIES), used - set(errors.ENTITIES)
    assert not re.search(r'(invalid|AppError)\((\d+,\s*"\w+",\s*)?f"', code)
