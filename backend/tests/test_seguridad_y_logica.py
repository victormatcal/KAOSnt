"""Seguridad local, exportaciones, aprobación, zona horaria y criterios 19-20 (lado servidor)."""
import io
import re
import zipfile
from datetime import datetime, timedelta, timezone

from fastapi.testclient import TestClient

from kaosnt.app import create_app
from kaosnt.backup import auto_backup_if_due, prune
from pathlib import Path

from kaosnt.config import FRONTEND_DIST, Config
from kaosnt.notes import suggested_title
from kaosnt.timeutil import add_hours, business_hours_between

S = {"timezone": "Europe/Madrid", "workdays": [1, 2, 3, 4, 5], "work_start": "09:00", "work_end": "18:00", "holidays": []}


def test_host_no_permitido(cfg, clock):
    with TestClient(create_app(cfg, clock=clock, background=False)) as c:
        assert c.get("/api/health").status_code == 421
        assert c.get("/api/health", headers={"host": "127.0.0.1:8765"}).json()["app"] == "kaosnt"
        assert c.get("/api/health", headers={"host": "evil.example:8765"}).status_code == 421


def test_escritura_requiere_cabecera_y_origen(client):
    assert client.post("/api/tasks", json={"title": "x"}, headers={"X-KAOSnt": ""}).status_code == 403
    assert client.post("/api/tasks", json={"title": "x"}, headers={"Origin": "http://evil.example"}).status_code == 403
    assert client.post("/api/tasks", json={"title": "x"}, headers={"Sec-Fetch-Site": "cross-site"}).status_code == 403
    assert client.post("/api/tasks", json={"title": "x"}, headers={"Origin": "http://127.0.0.1:8765"}).status_code == 201


def test_cabeceras_de_seguridad(client):
    r = client.get("/api/health")
    assert "default-src 'self'" in r.headers["content-security-policy"] and r.headers["x-frame-options"] == "DENY"


def test_enlaces_peligrosos_rechazados(client):
    for url in ("javascript:alert(1)", "data:text/html,x", "vbscript:x", " JaVaScRiPt:alert(1)"):
        assert client.post("/api/tasks", json={"title": "x", "links": [{"label": "a", "url": url}]}).status_code == 422, url
    assert client.post("/api/projects", json={"name": "p", "links": [{"label": "doc", "url": "https://example.com/a"}]}).status_code == 201


def test_campos_desconocidos_rechazados(client):
    assert client.post("/api/tasks", json={"title": "x", "hack": 1}).status_code == 422
    assert client.patch("/api/settings", json={"evil": 1}).status_code == 422
    assert client.patch("/api/settings", json={"app_name": "  "}).status_code == 422


def test_aprobacion_pendiente_advierte(client):
    t = client.post("/api/tasks", json={"title": "Evolutivo", "kind": "evolutivo", "approval": "pendiente"}).json()
    r = client.patch(f"/api/tasks/{t['id']}", json={"status": "en_curso"})
    assert r.status_code == 409 and r.json()["code"] == "aprobacion_pendiente"
    assert client.get(f"/api/tasks/{t['id']}").json()["status"] == "pendiente"
    r = client.patch(f"/api/tasks/{t['id']}", json={"status": "en_curso", "force": True})
    assert r.status_code == 200 and r.json()["approval"] == "pendiente"


def test_exportaciones(client):
    client.post("/api/tasks", json={"title": "=HYPERLINK(\"http://x\")"})
    csv = client.get("/api/export/tasks.csv")
    assert csv.headers["content-disposition"].startswith("attachment") and "'=HYPERLINK" in csv.text
    client.post("/api/notes", json={"content": "# Hola\ntexto"})
    z = zipfile.ZipFile(io.BytesIO(client.get("/api/export/notes.zip").content))
    name = z.namelist()[0]
    assert name.startswith("notas/") and name.endswith(".md") and "texto" in z.read(name).decode()


def test_copias_automaticas_y_retencion(cfg, client):
    s = client.get("/api/settings").json()
    assert auto_backup_if_due(cfg, s) is not None
    assert auto_backup_if_due(cfg, s) is None
    for i in range(5):
        (cfg.backup_dir / f"centro-2026010{i}-000000-auto.db").write_bytes(b"x")  # copias de la 0.1
    prune(cfg, 3)
    assert len(list(cfg.backup_dir.glob("*-auto.db"))) == 3
    assert any(f.name.startswith("kaosnt-") for f in cfg.backup_dir.glob("*-auto.db"))  # se conserva la más reciente


def test_horas_laborables_y_cambio_de_hora():
    start = datetime(2026, 10, 23, 15, 0, tzinfo=timezone.utc)  # viernes 17:00 CEST
    end = add_hours(start, 2, "laborable", S)
    assert end == datetime(2026, 10, 26, 9, 0, tzinfo=timezone.utc)  # lunes 10:00 CET
    assert add_hours(start, 2, "natural", S) == datetime(2026, 10, 23, 17, 0, tzinfo=timezone.utc)
    assert abs(business_hours_between(start, end, S) - 2) < 1e-9


def test_titulo_sugerido():
    assert suggested_title("\n\n   \n# Reunión **Alfa**\nresto") == "Reunión Alfa"
    assert suggested_title("---\n- [ ] tarea pendiente") == "tarea pendiente"
    assert suggested_title("```\ncodigo\n```\n") is None
    assert suggested_title("[enlace](https://x.y) tras") == "enlace tras"


def test_recordatorio_manual(client, clock):
    assert client.post("/api/reminders", json={"title": "Llamar a sistemas", "due_at": "2026-10-13T15:00:00Z"}).status_code == 201
    assert not [x for x in client.get("/api/reminders").json()["active"] if x["rule"] == "manual"]
    clock.dt += timedelta(hours=6)
    act = [x for x in client.get("/api/reminders").json()["active"] if x["rule"] == "manual"]
    assert len(act) == 1 and act[0]["title"] == "Llamar a sistemas"


def test_19_20_sin_recursos_externos_y_solo_local():
    assert Config(data_dir=Path(".")).host == "127.0.0.1"  # sin tocar carpetas reales
    assert FRONTEND_DIST.exists(), "Compila el frontend antes de ejecutar esta prueba"
    html = (FRONTEND_DIST / "index.html").read_text(encoding="utf-8")
    assert not re.search(r'(src|href)\s*=\s*"(https?:)?//', html)
    for f in (FRONTEND_DIST / "assets").glob("*"):
        text = f.read_text(encoding="utf-8", errors="ignore")
        assert not re.search(r'fetch\(\s*["\'`]https?://', text), f
        assert not re.search(r'url\(\s*["\']?(https?:)?//', text), f
        assert not re.search(r'import\s*\(?\s*["\']https?://', text), f
        assert "fonts.googleapis" not in text and "cdn." not in text, f
