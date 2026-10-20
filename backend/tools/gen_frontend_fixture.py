"""Genera frontend/tests/fixtures/demo-api.json con respuestas reales de la API sobre datos ficticios.
Lo usan las pruebas de renderizado del frontend (sin navegador)."""
import json
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient  # noqa: E402

from centro.app import create_app  # noqa: E402
from centro.config import Config  # noqa: E402
from centro.demo import seed_if_empty  # noqa: E402

URLS = ["/api/bootstrap", "/api/today", "/api/tasks", "/api/projects", "/api/projects/1", "/api/tasks?project_id=1",
        "/api/notes?project_id=1", "/api/people/1/view", "/api/people/2/view", "/api/notes?scope=todas", "/api/notes/1",
        "/api/recurrences", "/api/backups", "/api/tasks/2", "/api/tasks?include_backlog=1"]

with tempfile.TemporaryDirectory() as d:
    cfg = Config(data_dir=Path(d) / "demo", demo=True)
    cfg.ensure_dirs()
    seed_if_empty(cfg)
    with TestClient(create_app(cfg, background=False, extra_hosts=("testserver",))) as c:
        c.headers.update({"X-Centro": "1"})
        c.get("/api/today")
        out = {u: c.get(u).json() for u in URLS}
        from datetime import date, timedelta
        ws = date.today() - timedelta(days=date.today().weekday())
        out["__week__"] = ws.isoformat()
        out[f"/api/planning?week={ws.isoformat()}"] = c.get(f"/api/planning?week={ws.isoformat()}").json()
target = Path(__file__).resolve().parents[2] / "frontend" / "tests" / "fixtures" / "demo-api.json"
target.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print("Fixture escrito en", target)
