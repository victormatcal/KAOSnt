"""Seguridad local, exportaciones, aprobación, zona horaria y criterios 19-20 (lado servidor)."""
import re
from datetime import datetime, timezone
from pathlib import Path

from fastapi.testclient import TestClient

from centro.app import create_app
from centro.backup import auto_backup_if_due, create_backup, prune
from centro.config import FRONTEND_DIST, load_config
from centro.notes import suggested_title
from centro.timeutil import add_hours, business_hours_between

S = {"timezone": "Europe/Madrid", "workdays": [1, 2, 3, 4, 5], "work_start": "09:00", "work_end": "18:00", "holidays": []}


def test_host_no_permitido(cfg, clock):
    app = create_app(cfg, clock=clock, background=False)  # sin 'testserver' permitido
    with TestClient(app) as c:
        assert c.get("/api/health").status_code == 421
        assert c.get("/api/health", headers={"host": "127.0.0.1:8765"}).status_code == 200
        assert c.get("/api/health", headers={"host": "evil.example:8765"}).status_code == 421


def test_escritura_requiere_cabecera_y_origen(client):
    assert client.post("/api/tasks", json={"title": "x"}, headers={"X-Centro": ""}).status_code == 403
    r = client.post("/api/tasks", json={"title": "x"}, headers={"Origin": "http://evil.example"})
    assert r.status_code == 403
    r = client.post("/api/tasks", json={"title": "x"}, headers={"Sec-Fetch-Site": "cross-site"})
    assert r.status_code == 403
    r = client.post("/api/tasks", json={"title": "x"}, headers={"Origin": "http://127.0.0.1:8765"})
    assert r.status_code == 201


def test_cabeceras_de_seguridad(client):
    r = client.get("/api/health")
    assert "default-src 'self'" in r.headers["content-security-policy"]
    assert r.headers["x-frame-options"] == "DENY"


def test_enlaces_peligrosos_rechazados(client):
    for url in ("javascript:alert(1)", "data:text/html,x", "vbscript:x", " JaVaScRiPt:alert(1)"):
        r = client.post("/api/tasks", json={"title": "x", "links": [{"label": "a", "url": url}]})
        assert r.status_code == 422, url
    ok = client.post("/api/projects", json={"name": "p", "links": [{"label": "doc", "url": "https://example.com/a"}]})
    assert ok.status_code == 201


def test_campos_desconocidos_rechazados(client):
    assert client.post("/api/tasks", json={"title": "x", "hack": 1}).status_code == 422
    assert client.patch("/api/settings", json={"evil": 1}).status_code == 422


def test_aprobacion_pendiente_advierte(client):
    t = client.post("/api/tasks", json={"title": "Evolutivo", "kind": "evolutivo", "approval": "pendiente"}).json()
    r = client.patch(f"/api/tasks/{t['id']}", json={"status": "en_curso"})
    assert r.status_code == 409 and r.json()["code"] == "aprobacion_pendiente"
    assert client.get(f"/api/tasks/{t['id']}").json()["status"] == "pendiente"
    # el análisis previo sí es posible (en revisión, etc.) y se puede confirmar explícitamente
    r = client.patch(f"/api/tasks/{t['id']}", json={"status": "en_curso", "force": True})
    assert r.status_code == 200 and r.json()["approval"] == "pendiente"


def test_exportaciones(client):
    client.post("/api/tasks", json={"title": "=HYPERLINK(\"http://x\")"})
    csv = client.get("/api/export/tasks.csv")
    assert csv.headers["content-disposition"].startswith("attachment")
    assert "'=HYPERLINK" in csv.text
    client.post("/api/notes", json={"content": "# Hola\ntexto"})
    import io
    import zipfile
    z = zipfile.ZipFile(io.BytesIO(client.get("/api/export/notes.zip").content))
    name = z.namelist()[0]
    assert name.startswith("notas/") and name.endswith(".md")
    assert "texto" in z.read(name).decode()


def test_copias_automaticas_y_retencion(cfg, client):
    s = client.get("/api/settings").json()
    assert auto_backup_if_due(cfg, s) is not None
    assert auto_backup_if_due(cfg, s) is None  # una al día
    for i in range(5):
        (cfg.backup_dir / f"centro-2026010{i}-000000-auto.db").write_bytes(b"x")
    prune(cfg, 3)
    assert len(list(cfg.backup_dir.glob("*-auto.db"))) == 3


def test_copia_previa_a_migracion(cfg, clock, monkeypatch):
    from centro import db as dbm
    with TestClient(create_app(cfg, clock=clock, background=False, extra_hosts=("testserver",))):
        pass
    extra = Path(dbm.MIGRATIONS_DIR) / "999_prueba.sql"
    fake = list(dbm.migration_files()) + [(999, extra)]
    monkeypatch.setattr(dbm, "migration_files", lambda: fake)
    extra_sql = "CREATE TABLE prueba_migracion (id INTEGER);"
    orig_read = Path.read_text
    monkeypatch.setattr(Path, "read_text", lambda self, *a, **k: extra_sql if self == extra else orig_read(self, *a, **k))
    create_app(cfg, clock=clock, background=False)
    assert list(cfg.backup_dir.glob("*-previa-migracion.db"))


def test_horas_laborables_y_cambio_de_hora():
    # viernes 23/10/2026 17:00 Madrid (CEST, UTC+2) + 2 h laborables → lunes 26/10 10:00 (CET, UTC+1)
    start = datetime(2026, 10, 23, 15, 0, tzinfo=timezone.utc)
    end = add_hours(start, 2, "laborable", S)
    assert end == datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc)
    assert add_hours(start, 2, "natural", S) == datetime(2026, 10, 23, 17, 0, tzinfo=timezone.utc)
    assert abs(business_hours_between(start, end, S) - 2) < 1e-9


def test_titulo_sugerido():
    assert suggested_title("\n\n   \n# Reunión **Alfa**\nresto") == "Reunión Alfa"
    assert suggested_title("---\n- [ ] tarea pendiente") == "tarea pendiente"
    assert suggested_title("```\ncodigo\n```\n") is None
    assert suggested_title("[enlace](https://x.y) tras") == "enlace tras"


# 19/20. Funcionamiento sin Internet: sin recursos externos en el frontend y escucha solo local
def test_19_20_sin_recursos_externos_y_solo_local():
    assert load_config().host == "127.0.0.1"
    assert FRONTEND_DIST.exists(), "Compila el frontend antes de ejecutar esta prueba"
    html = (FRONTEND_DIST / "index.html").read_text(encoding="utf-8")
    assert not re.search(r'(src|href)\s*=\s*"(https?:)?//', html)
    for f in (FRONTEND_DIST / "assets").glob("*"):
        text = f.read_text(encoding="utf-8", errors="ignore")
        # peticiones o recursos remotos: fetch/import/url()/src con URL absoluta
        assert not re.search(r'fetch\(\s*["\'`]https?://', text), f
        assert not re.search(r'url\(\s*["\']?(https?:)?//', text), f
        assert not re.search(r'import\s*\(?\s*["\']https?://', text), f
        assert "fonts.googleapis" not in text and "cdn." not in text, f


def test_recordatorio_manual(client, clock):
    from datetime import timedelta
    r = client.post("/api/reminders", json={"title": "Llamar a sistemas", "due_at": "2026-10-13T15:00:00Z"})
    assert r.status_code == 201
    assert not [x for x in client.get("/api/reminders").json()["active"] if x["rule"] == "manual"]
    clock.dt += timedelta(hours=6)
    act = [x for x in client.get("/api/reminders").json()["active"] if x["rule"] == "manual"]
    assert len(act) == 1 and act[0]["title"] == "Llamar a sistemas"


def test_vista_persona_conserva_campo_active(client):
    pid = client.post("/api/people", json={"name": "Ana"}).json()["id"]
    v = client.get(f"/api/people/{pid}/view").json()
    assert v["active"] == 1 and v["active_tasks"] == []
