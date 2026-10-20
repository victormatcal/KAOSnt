"""Genera frontend/tests/fixtures/demo-api.json con respuestas reales de la API sobre datos ficticios.
Lo usan las pruebas de renderizado del frontend (sin navegador). Uso: python backend/tools/gen_frontend_fixture.py"""
import json
import sys
import tempfile
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from fastapi.testclient import TestClient  # noqa: E402

from kaosnt.app import create_app  # noqa: E402
from kaosnt.config import Config  # noqa: E402
from kaosnt.demo import seed_if_empty  # noqa: E402

today = date.today()
ws = today - timedelta(days=today.weekday())
grid0 = date(today.year, today.month, 1)
grid0 -= timedelta(days=grid0.weekday())
URLS = ["/api/bootstrap", "/api/today", "/api/tasks", "/api/projects", "/api/projects/1", "/api/tasks?project_id=1",
        "/api/notes?project_id=1", "/api/people/1/view", "/api/people/2/view", "/api/notes?scope=todas", "/api/notes/1",
        "/api/recurrences", "/api/backups", "/api/tasks/2", "/api/tasks/1", "/api/tasks?include_backlog=1", "/api/tags",
        "/api/locations", f"/api/holidays?year={today.year}", "/api/clients", "/api/tasks?archived=only",
        f"/api/planning?week={ws.isoformat()}",
        f"/api/calendar-context?start={ws.isoformat()}&end={(ws + timedelta(days=6)).isoformat()}",
        f"/api/calendar-context?start={grid0.isoformat()}&end={(grid0 + timedelta(days=41)).isoformat()}"]

with tempfile.TemporaryDirectory() as d:
    cfg = Config(data_dir=Path(d) / "demo", demo=True)
    cfg.ensure_dirs()
    seed_if_empty(cfg)
    with TestClient(create_app(cfg, background=False, extra_hosts=("testserver",))) as c:
        c.headers.update({"X-KAOSnt": "1"})
        c.get("/api/today")
        out = {u: c.get(u).json() for u in URLS}
        out["__week__"] = ws.isoformat()
        out["__today__"] = today.isoformat()
target = Path(__file__).resolve().parents[2] / "frontend" / "tests" / "fixtures" / "demo-api.json"
target.write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print("Fixture escrito en", target)
