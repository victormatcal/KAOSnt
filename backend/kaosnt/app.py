"""Aplicación FastAPI: API local + frontend compilado. Escucha solo en 127.0.0.1."""
from __future__ import annotations

import json
import logging
import threading
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
from typing import Any, Callable, Optional

from fastapi import Depends, FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles

from . import APP_ID, __version__, agenda, backup, notes, recurrence, reminders, search, tasks, views
from . import db as dbm
from . import schemas as S
from .config import FRONTEND_DIST, Config
from .db import Tx, connect, init_db, jdump, now_utc, row, rows
from .errors import AppError, invalid, not_found
from .settings import EDITABLE, get_all, set_value
from .timeutil import today_local

log = logging.getLogger("kaosnt")

CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
       "connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; "
       "frame-ancestors 'none'")
WRITE_HEADER = "x-kaosnt"


def create_app(cfg: Config, clock: Optional[Callable[[], datetime]] = None, background: bool = True,
               extra_hosts: tuple[str, ...] = ()) -> FastAPI:
    cfg.ensure_dirs()
    dbm.set_clock(clock)
    init_db(cfg.db_path, lambda _v: backup.create_backup(cfg, "previa-migracion"))
    allowed_hosts = {f"127.0.0.1:{cfg.port}", f"localhost:{cfg.port}", *extra_hosts}
    allowed_origins = {f"http://127.0.0.1:{cfg.port}", f"http://localhost:{cfg.port}"}
    stop = threading.Event()

    def now() -> datetime:
        return clock() if clock else datetime.now(timezone.utc)

    def maintenance() -> None:
        """Recurrencias, recordatorios y copia diaria. Al abrir y cada 5 minutos."""
        conn = connect(cfg.db_path)
        try:
            st = get_all(conn)
            with Tx(conn):
                recurrence.generate(conn, st, today_local(st, now()))
                reminders.refresh(conn, st, now())
            backup.auto_backup_if_due(cfg, st)
        except Exception:
            log.exception("Error en mantenimiento periódico")
        finally:
            conn.close()

    def loop() -> None:
        while not stop.wait(300):
            maintenance()

    @asynccontextmanager
    async def lifespan(_app: FastAPI):
        conn = connect(cfg.db_path)
        try:
            with Tx(conn):
                if not conn.execute("SELECT 1 FROM people WHERE is_me = 1").fetchone():
                    ts = now_utc()
                    conn.execute("INSERT INTO people(name, role, is_me, created_at, updated_at) VALUES (?,?,?,?,?)", ("Yo", "", 1, ts, ts))
        finally:
            conn.close()
        if background:
            maintenance()
            threading.Thread(target=loop, daemon=True, name="mantenimiento").start()
        yield
        stop.set()
        c = connect(cfg.db_path)
        try:
            c.execute("PRAGMA wal_checkpoint(TRUNCATE)")
        finally:
            c.close()

    app = FastAPI(title="KAOSnt", version=__version__, lifespan=lifespan, docs_url=None, redoc_url=None, openapi_url=None)
    app.state.cfg = cfg
    app.state.server = None

    # ---------------- Seguridad ----------------
    @app.middleware("http")
    async def security(request: Request, call_next):
        if request.headers.get("host", "") not in allowed_hosts:
            return PlainTextResponse("Host no permitido", status_code=421)
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            origin = request.headers.get("origin")
            site = request.headers.get("sec-fetch-site")
            if (origin is not None and origin not in allowed_origins) or (site is not None and site not in ("same-origin", "none")):
                return JSONResponse({"code": "origen", "message": "Origen no permitido"}, status_code=403)
            if request.headers.get(WRITE_HEADER) != "1":
                return JSONResponse({"code": "cabecera", "message": "Falta la cabecera de protección"}, status_code=403)
            limit = 200 * 1024 * 1024 if request.url.path.startswith("/api/restore") else 5 * 1024 * 1024
            if int(request.headers.get("content-length") or 0) > limit:
                return JSONResponse({"code": "tamano", "message": "Contenido demasiado grande"}, status_code=413)
        resp: Response = await call_next(request)
        resp.headers["Content-Security-Policy"] = CSP
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "no-referrer"
        resp.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        resp.headers["Cross-Origin-Resource-Policy"] = "same-origin"
        if request.url.path.startswith("/api"):
            resp.headers["Cache-Control"] = "no-store"
        return resp

    @app.exception_handler(AppError)
    async def app_error(_req: Request, exc: AppError):
        return JSONResponse({"code": exc.code, "message": exc.message, **exc.extra}, status_code=exc.status)

    @app.exception_handler(Exception)
    async def unexpected(_req: Request, exc: Exception):
        log.error("Error inesperado: %s", type(exc).__name__, exc_info=exc)  # sin cuerpo de la petición
        return JSONResponse({"code": "error_interno", "message": "Error interno: la operación no se ha completado. "
                             "Reintenta y, si persiste, reinicia la aplicación y revisa la consola."}, status_code=500)

    @app.exception_handler(RequestValidationError)
    async def validation_error(_req: Request, exc: RequestValidationError):
        msgs = []
        for e in exc.errors()[:5]:
            loc = ".".join(str(x) for x in e.get("loc", [])[1:])
            msgs.append(f"{loc}: {e.get('msg')}" if loc else str(e.get("msg")))
        return JSONResponse({"code": "validacion", "message": "Datos no válidos. " + "; ".join(msgs)}, status_code=422)

    def db():
        conn = connect(cfg.db_path)
        try:
            yield conn
        finally:
            conn.close()

    def st(conn) -> dict[str, Any]:
        return get_all(conn)

    def dump(m) -> dict[str, Any]:
        return m.model_dump(exclude_unset=True, mode="json")

    def exists(conn, table: str, id_: Any, label: str) -> None:
        if id_ is not None and not conn.execute(f"SELECT 1 FROM {table} WHERE id = ?", (id_,)).fetchone():
            raise invalid(f"{label} no existe")

    def patch_simple(conn, table: str, id_: int, data: dict[str, Any], label: str, stamp: bool = True):
        if not conn.execute(f"SELECT 1 FROM {table} WHERE id = ?", (id_,)).fetchone():
            raise not_found(label)
        if data:
            if stamp:
                data["updated_at"] = now_utc()
            with Tx(conn):
                conn.execute(f"UPDATE {table} SET {', '.join(f'{k} = ?' for k in data)} WHERE id = ?", [*data.values(), id_])
        return row(conn.execute(f"SELECT * FROM {table} WHERE id = ?", (id_,)).fetchone())

    def detail(conn, tid: int):
        return tasks.task_detail(conn, tid)

    # ---------------- Sistema ----------------
    @app.get("/api/health")
    def health():
        return {"ok": True, "app": APP_ID, "version": __version__}

    @app.get("/api/bootstrap")
    def bootstrap(conn=Depends(db)):
        return {
            "version": __version__, "demo": cfg.demo, "data_dir": str(cfg.data_dir),
            "settings": st(conn), "me_id": views.me_id(conn),
            "people": rows(conn.execute("SELECT * FROM people ORDER BY is_me DESC, active DESC, name")),
            "clients": list_clients(conn),
            "locations": rows(conn.execute("SELECT * FROM locations ORDER BY name")),
            "projects": views.list_projects(conn, include_archived=True),
            "tags": [r["name"] for r in conn.execute("SELECT name FROM tags ORDER BY name COLLATE NOCASE")],
            "saved_views": [{**v, "filters": json.loads(v["filters"])} for v in rows(conn.execute("SELECT * FROM saved_views ORDER BY name"))],
            "groupings": rows(conn.execute("SELECT * FROM groupings ORDER BY project_id, kind, position, id")),
        }

    @app.post("/api/system/shutdown")
    def shutdown():
        if app.state.server is None:
            raise AppError(409, "sin_servidor", "El cierre controlado solo está disponible al ejecutar la aplicación")
        app.state.server.should_exit = True
        return {"ok": True, "message": "La aplicación se está cerrando. Puedes cerrar esta pestaña."}

    # ---------------- Ajustes ----------------
    @app.get("/api/settings")
    def get_settings(conn=Depends(db)):
        return st(conn)

    @app.patch("/api/settings")
    def patch_settings(body: dict[str, Any], conn=Depends(db)):
        bad = set(body) - EDITABLE
        if bad:
            raise invalid(f"Ajustes desconocidos: {', '.join(sorted(bad))}")
        if "timezone" in body:
            from zoneinfo import ZoneInfo
            try:
                ZoneInfo(str(body["timezone"]))
            except Exception:
                raise invalid("Zona horaria no válida")
        if "app_name" in body and not str(body["app_name"]).strip():
            raise invalid("El nombre de la aplicación no puede estar vacío")
        with Tx(conn):
            for k, v in body.items():
                set_value(conn, k, v)
        return st(conn)

    # ---------------- Clientes ----------------
    def list_clients(conn):
        return rows(conn.execute(
            "SELECT c.*, (SELECT COUNT(*) FROM projects p WHERE p.client_id = c.id) AS projects FROM clients c ORDER BY c.name COLLATE NOCASE"))

    @app.get("/api/clients")
    def get_clients(conn=Depends(db)):
        return list_clients(conn)

    @app.post("/api/clients", status_code=201)
    def create_client(body: S.ClientIn, conn=Depends(db)):
        ts = now_utc()
        with Tx(conn):
            cid = conn.execute("INSERT INTO clients(name, notes, created_at, updated_at) VALUES (?,?,?,?)",
                               (body.name.strip(), body.notes, ts, ts)).lastrowid
        return row(conn.execute("SELECT * FROM clients WHERE id = ?", (cid,)).fetchone())

    @app.patch("/api/clients/{cid}")
    def patch_client(cid: int, body: S.ClientPatch, conn=Depends(db)):
        d = dump(body)
        if d.get("name"):
            d["name"] = d["name"].strip()
        return patch_simple(conn, "clients", cid, d, "Cliente")

    @app.delete("/api/clients/{cid}")
    def delete_client(cid: int, conn=Depends(db)):
        with Tx(conn):  # los proyectos se conservan sin cliente
            if not conn.execute("DELETE FROM clients WHERE id = ?", (cid,)).rowcount:
                raise not_found("Cliente")
        return {"ok": True}

    # ---------------- Oficinas y festivos ----------------
    @app.get("/api/locations")
    def get_locations(conn=Depends(db)):
        return rows(conn.execute(
            """SELECT l.*, (SELECT COUNT(*) FROM people p WHERE p.location_id = l.id) AS people,
                      (SELECT COUNT(*) FROM holidays h WHERE h.location_id = l.id) AS holidays
               FROM locations l ORDER BY l.name COLLATE NOCASE"""))

    @app.post("/api/locations", status_code=201)
    def create_location(body: S.LocationIn, conn=Depends(db)):
        name = body.name.strip()
        if conn.execute("SELECT 1 FROM locations WHERE name = ?", (name,)).fetchone():
            raise invalid("Ya existe una oficina con ese nombre")
        with Tx(conn):
            lid = conn.execute("INSERT INTO locations(name, created_at) VALUES (?,?)", (name, now_utc())).lastrowid
        return row(conn.execute("SELECT * FROM locations WHERE id = ?", (lid,)).fetchone())

    @app.patch("/api/locations/{lid}")
    def patch_location(lid: int, body: S.LocationIn, conn=Depends(db)):
        if conn.execute("SELECT 1 FROM locations WHERE name = ? AND id <> ?", (body.name.strip(), lid)).fetchone():
            raise invalid("Ya existe una oficina con ese nombre")
        return patch_simple(conn, "locations", lid, {"name": body.name.strip()}, "Oficina", stamp=False)

    @app.delete("/api/locations/{lid}")
    def delete_location(lid: int, conn=Depends(db)):
        with Tx(conn):  # sus festivos se eliminan; las personas quedan sin oficina
            conn.execute("DELETE FROM locations WHERE id = ?", (lid,))
        return {"ok": True}

    @app.get("/api/holidays")
    def get_holidays(year: Optional[int] = None, conn=Depends(db)):
        q = "SELECT h.*, l.name AS location FROM holidays h LEFT JOIN locations l ON l.id = h.location_id"
        params: list[Any] = []
        if year:
            q += " WHERE h.date LIKE ?"
            params.append(f"{year}-%")
        return rows(conn.execute(q + " ORDER BY h.date, l.name", params))

    @app.post("/api/holidays", status_code=201)
    def create_holiday(body: S.HolidayIn, conn=Depends(db)):
        exists(conn, "locations", body.location_id, "Oficina")
        dup = conn.execute("SELECT 1 FROM holidays WHERE date = ? AND IFNULL(location_id, 0) = IFNULL(?, 0)",
                           (body.date, body.location_id)).fetchone()
        if dup:
            raise invalid("Ese festivo ya está registrado para esa oficina")
        with Tx(conn):
            hid = conn.execute("INSERT INTO holidays(date, name, location_id, created_at) VALUES (?,?,?,?)",
                               (body.date, body.name.strip(), body.location_id, now_utc())).lastrowid
        return row(conn.execute("SELECT * FROM holidays WHERE id = ?", (hid,)).fetchone())

    @app.delete("/api/holidays/{hid}")
    def delete_holiday(hid: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM holidays WHERE id = ?", (hid,))
        return {"ok": True}

    @app.get("/api/calendar-context")
    def calendar_context(start: str, end: str, conn=Depends(db)):
        try:
            a, b = date.fromisoformat(start), date.fromisoformat(end)
        except ValueError:
            raise invalid("Fechas no válidas")
        if (b - a).days > 400 or b < a:
            raise invalid("Rango de fechas no válido")
        return agenda.context(conn, a, b)

    # ---------------- Personas y ausencias ----------------
    @app.get("/api/people")
    def list_people(conn=Depends(db)):
        return rows(conn.execute("SELECT * FROM people ORDER BY is_me DESC, active DESC, name"))

    @app.post("/api/people", status_code=201)
    def create_person(body: S.PersonIn, conn=Depends(db)):
        exists(conn, "locations", body.location_id, "Oficina")
        ts = now_utc()
        with Tx(conn):
            pid = conn.execute(
                "INSERT INTO people(name, role, weekly_capacity_hours, location_id, active, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
                (body.name.strip(), body.role, body.weekly_capacity_hours, body.location_id, 1 if body.active else 0,
                 body.notes, ts, ts)).lastrowid
        return row(conn.execute("SELECT * FROM people WHERE id = ?", (pid,)).fetchone())

    @app.patch("/api/people/{pid}")
    def patch_person(pid: int, body: S.PersonPatch, conn=Depends(db)):
        d = dump(body)
        exists(conn, "locations", d.get("location_id"), "Oficina")
        if "active" in d:
            d["active"] = 1 if d["active"] else 0
        return patch_simple(conn, "people", pid, d, "Persona")

    @app.get("/api/people/{pid}/view")
    def person_view(pid: int, conn=Depends(db)):
        return views.person_view(conn, pid, st(conn), now())

    @app.get("/api/absences")
    def list_absences(person_id: Optional[int] = None, conn=Depends(db)):
        q, p = "SELECT a.*, pe.name AS person_name FROM absences a JOIN people pe ON pe.id = a.person_id", []
        if person_id:
            q += " WHERE a.person_id = ?"
            p.append(person_id)
        return rows(conn.execute(q + " ORDER BY a.start_date DESC", p))

    @app.post("/api/absences", status_code=201)
    def create_absence(body: S.AbsenceIn, conn=Depends(db)):
        if body.end_date < body.start_date:
            raise invalid("La fecha de fin es anterior a la de inicio")
        exists(conn, "people", body.person_id, "Persona")
        with Tx(conn):
            aid = conn.execute("INSERT INTO absences(person_id, start_date, end_date, label, created_at) VALUES (?,?,?,?,?)",
                               (body.person_id, body.start_date, body.end_date, body.label, now_utc())).lastrowid
        return row(conn.execute("SELECT * FROM absences WHERE id = ?", (aid,)).fetchone())

    @app.delete("/api/absences/{aid}")
    def delete_absence(aid: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM absences WHERE id = ?", (aid,))
        return {"ok": True}

    # ---------------- Proyectos ----------------
    @app.get("/api/projects")
    def list_projects(include_archived: bool = False, conn=Depends(db)):
        return views.list_projects(conn, include_archived)

    @app.post("/api/projects", status_code=201)
    def create_project(body: S.ProjectIn, conn=Depends(db)):
        d = body.model_dump(mode="json")
        exists(conn, "clients", d.get("client_id"), "Cliente")
        ts = now_utc()
        d["links"] = jdump(d["links"])
        d.update(created_at=ts, updated_at=ts, summary_updated_at=ts if d["summary"] else None)
        with Tx(conn):
            pid = conn.execute(f"INSERT INTO projects({','.join(d)}) VALUES ({','.join('?' for _ in d)})", list(d.values())).lastrowid
        return views.project_overview(conn, pid, st(conn), now())

    @app.get("/api/projects/{pid}")
    def get_project(pid: int, conn=Depends(db)):
        return views.project_overview(conn, pid, st(conn), now())

    @app.patch("/api/projects/{pid}")
    def patch_project(pid: int, body: S.ProjectPatch, conn=Depends(db)):
        d = dump(body)
        cur = row(conn.execute("SELECT * FROM projects WHERE id = ?", (pid,)).fetchone())
        if not cur:
            raise not_found("Proyecto")
        if "status" in d and d["status"] is None:
            raise invalid("El estado es obligatorio")
        exists(conn, "clients", d.get("client_id"), "Cliente")
        if "links" in d:
            d["links"] = jdump(d["links"] or [])
        for k in ("summary", "next_action", "objective", "phase", "health_note"):
            if k in d and d[k] is None:
                d[k] = ""
        if "summary" in d and d["summary"] != cur["summary"]:
            d["summary_updated_at"] = now_utc()
        patch_simple(conn, "projects", pid, d, "Proyecto")
        return views.project_overview(conn, pid, st(conn), now())

    @app.post("/api/projects/{pid}/people")
    def add_project_person(pid: int, body: S.ProjectPersonIn, conn=Depends(db)):
        exists(conn, "projects", pid, "Proyecto")
        exists(conn, "people", body.person_id, "Persona")
        d = dump(body)
        with Tx(conn):
            conn.execute("INSERT OR IGNORE INTO project_people(project_id, person_id) VALUES (?,?)", (pid, body.person_id))
            for k in ("role", "dedication_pct"):
                if k in d:
                    conn.execute(f"UPDATE project_people SET {k} = ? WHERE project_id = ? AND person_id = ?",
                                 (d[k] if d[k] is not None or k == "dedication_pct" else "", pid, body.person_id))
        return {"ok": True}

    @app.delete("/api/projects/{pid}/people/{person_id}")
    def remove_project_person(pid: int, person_id: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM project_people WHERE project_id = ? AND person_id = ?", (pid, person_id))
        return {"ok": True}

    @app.post("/api/projects/{pid}/groupings", status_code=201)
    def create_grouping(pid: int, body: S.GroupingIn, conn=Depends(db)):
        exists(conn, "projects", pid, "Proyecto")
        with Tx(conn):
            gid = conn.execute("INSERT INTO groupings(project_id, kind, name, position) VALUES (?,?,?,?)",
                               (pid, body.kind, body.name.strip(), body.position)).lastrowid
        return row(conn.execute("SELECT * FROM groupings WHERE id = ?", (gid,)).fetchone())

    @app.patch("/api/groupings/{gid}")
    def patch_grouping(gid: int, body: S.GroupingPatch, conn=Depends(db)):
        return patch_simple(conn, "groupings", gid, dump(body), "Agrupación", stamp=False)

    @app.delete("/api/groupings/{gid}")
    def delete_grouping(gid: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM groupings WHERE id = ?", (gid,))
        return {"ok": True}

    @app.post("/api/projects/{pid}/milestones", status_code=201)
    def create_milestone(pid: int, body: S.MilestoneIn, conn=Depends(db)):
        exists(conn, "projects", pid, "Proyecto")
        ts = now_utc()
        with Tx(conn):
            mid = conn.execute(
                "INSERT INTO milestones(project_id, kind, title, date, status, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
                (pid, body.kind, body.title, body.date, body.status, body.notes, ts, ts)).lastrowid
        return row(conn.execute("SELECT * FROM milestones WHERE id = ?", (mid,)).fetchone())

    @app.patch("/api/milestones/{mid}")
    def patch_milestone(mid: int, body: S.MilestonePatch, conn=Depends(db)):
        return patch_simple(conn, "milestones", mid, dump(body), "Hito")

    @app.delete("/api/milestones/{mid}")
    def delete_milestone(mid: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM milestones WHERE id = ?", (mid,))
        return {"ok": True}

    # ---------------- Tareas ----------------
    @app.get("/api/tasks")
    def list_tasks(request: Request, conn=Depends(db)):
        f = dict(request.query_params)
        for b in ("include_backlog", "include_closed", "include_archived"):
            f[b] = f.get(b) in ("1", "true")
        return tasks.list_tasks(conn, f)

    @app.post("/api/tasks", status_code=201)
    def create_task(body: S.TaskCreate, conn=Depends(db)):
        d = dump(body)
        d["title"] = d["title"].strip()
        if not d["title"]:
            raise invalid("El título es obligatorio")
        with Tx(conn):
            tid = tasks.create_task(conn, d)
        return detail(conn, tid)

    @app.get("/api/tasks/{tid}")
    def get_task(tid: int, conn=Depends(db)):
        return detail(conn, tid)  # solo lectura: abrir nunca modifica el seguimiento

    @app.patch("/api/tasks/{tid}")
    def patch_task(tid: int, body: S.TaskPatch, conn=Depends(db)):
        with Tx(conn):
            tasks.update_task(conn, tid, dump(body))
        return detail(conn, tid)

    @app.delete("/api/tasks/{tid}")
    def delete_task(tid: int, conn=Depends(db)):
        if not tasks.get_task_row(conn, tid)["archived"]:
            raise invalid("Archiva la tarea antes de eliminarla definitivamente")
        with Tx(conn):
            conn.execute("DELETE FROM tasks WHERE id = ?", (tid,))
        return {"ok": True}

    @app.post("/api/tasks/{tid}/update")
    def task_update_note(tid: int, body: S.TaskUpdateNote, conn=Depends(db)):
        with Tx(conn):
            tasks.record_update(conn, tid, body.text)
        return detail(conn, tid)

    @app.patch("/api/tasks/{tid}/history/{hid}")
    def edit_history(tid: int, hid: int, body: S.TaskUpdateNote, conn=Depends(db)):
        with Tx(conn):
            tasks.edit_update(conn, tid, hid, body.text)
        return detail(conn, tid)

    @app.post("/api/tasks/{tid}/follow-up")
    def task_follow_up(tid: int, body: S.FollowUpIn, conn=Depends(db)):
        with Tx(conn):
            tasks.record_follow_up(conn, tid, body.text)
        return detail(conn, tid)

    @app.post("/api/tasks/{tid}/dependencies")
    def add_dep(tid: int, body: S.DependencyIn, conn=Depends(db)):
        with Tx(conn):
            tasks.add_dependency(conn, tid, body.depends_on_id)
        return detail(conn, tid)

    @app.delete("/api/tasks/{tid}/dependencies/{dep}")
    def del_dep(tid: int, dep: int, conn=Depends(db)):
        with Tx(conn):
            tasks.remove_dependency(conn, tid, dep)
        return detail(conn, tid)

    @app.post("/api/tasks/{tid}/reorder")
    def reorder(tid: int, body: S.ReorderIn, conn=Depends(db)):
        with Tx(conn):
            tasks.reorder(conn, tid, body.status, body.before_id, body.after_id, body.force)
        return detail(conn, tid)

    @app.put("/api/tasks/{tid}/allocations")
    def put_alloc(tid: int, body: S.AllocationIn, conn=Depends(db)):
        with Tx(conn):
            tasks.set_allocation(conn, tid, body.week_start, body.hours)
        return detail(conn, tid)

    @app.post("/api/tasks/{tid}/skip")
    def skip(tid: int, conn=Depends(db)):
        with Tx(conn):
            recurrence.skip_occurrence(conn, tid)
        return detail(conn, tid)

    @app.post("/api/tasks/{tid}/recurrence")
    def make_recurring(tid: int, body: S.RuleIn, conn=Depends(db)):
        s = st(conn)
        with Tx(conn):
            recurrence.make_recurring(conn, tid, body.model_dump(mode="json"), s, today_local(s, now()))
        return detail(conn, tid)

    @app.post("/api/tasks/{tid}/steps", status_code=201)
    def add_step(tid: int, body: S.StepIn, conn=Depends(db)):
        with Tx(conn):
            tasks.add_step(conn, tid, body.text)
        return detail(conn, tid)

    @app.patch("/api/steps/{sid}")
    def patch_step(sid: int, body: S.StepPatch, conn=Depends(db)):
        with Tx(conn):
            tid = tasks.update_step(conn, sid, dump(body))
        return detail(conn, tid)

    @app.delete("/api/steps/{sid}")
    def delete_step(sid: int, conn=Depends(db)):
        with Tx(conn):
            tid = tasks.delete_step(conn, sid)
        return detail(conn, tid)

    @app.post("/api/steps/{sid}/promote")
    def promote_step(sid: int, conn=Depends(db)):
        with Tx(conn):
            new_id = tasks.promote_step(conn, sid)
        return detail(conn, new_id)

    # ---------------- Etiquetas ----------------
    @app.get("/api/tags")
    def list_tags(conn=Depends(db)):
        return tasks.list_tags(conn)

    @app.patch("/api/tags/{tag_id}")
    def rename_tag(tag_id: int, body: S.TagPatch, conn=Depends(db)):
        with Tx(conn):
            tasks.rename_tag(conn, tag_id, body.name)
        return tasks.list_tags(conn)

    @app.delete("/api/tags/{tag_id}")
    def delete_tag(tag_id: int, conn=Depends(db)):
        with Tx(conn):  # se quita de tareas y notas; estas no se modifican de otro modo
            conn.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
        return tasks.list_tags(conn)

    # ---------------- Recurrencias ----------------
    @app.get("/api/recurrences")
    def list_rec(conn=Depends(db)):
        return recurrence.list_all(conn)

    @app.post("/api/recurrences", status_code=201)
    def create_rec(body: S.RecurrenceIn, conn=Depends(db)):
        s = st(conn)
        with Tx(conn):
            rid = recurrence.create(conn, body.model_dump(mode="json"))
            recurrence.generate(conn, s, today_local(s, now()))
        return next(r for r in recurrence.list_all(conn) if r["id"] == rid)

    @app.patch("/api/recurrences/{rid}")
    def patch_rec(rid: int, body: S.RecurrencePatch, conn=Depends(db)):
        s = st(conn)
        with Tx(conn):
            recurrence.update(conn, rid, dump(body), today_local(s, now()))
            recurrence.generate(conn, s, today_local(s, now()))
        return next(r for r in recurrence.list_all(conn) if r["id"] == rid)

    # ---------------- Notas ----------------
    @app.get("/api/notes")
    def list_notes(request: Request, conn=Depends(db)):
        return notes.list_notes(conn, dict(request.query_params))

    @app.post("/api/notes", status_code=201)
    def create_note(body: S.NoteCreate, conn=Depends(db)):
        with Tx(conn):
            nid = notes.create_note(conn, dump(body))
        return notes.note_detail(conn, nid)

    @app.get("/api/notes/{nid}")
    def get_note(nid: int, conn=Depends(db)):
        return notes.note_detail(conn, nid)

    @app.patch("/api/notes/{nid}")
    def patch_note(nid: int, body: S.NotePatch, conn=Depends(db)):
        with Tx(conn):
            return notes.update_note(conn, nid, dump(body))

    @app.delete("/api/notes/{nid}")
    def purge_note(nid: int, conn=Depends(db)):
        with Tx(conn):
            notes.purge_note(conn, nid)
        return {"ok": True}

    @app.post("/api/notes/{nid}/to-task", status_code=201)
    def note_to_task(nid: int, body: S.NoteToTaskIn, conn=Depends(db)):
        with Tx(conn):
            tid = notes.note_to_task(conn, nid, body.model_dump(mode="json"))
        return detail(conn, tid)

    @app.post("/api/notes/{nid}/links")
    def link_note(nid: int, body: S.NoteLinkIn, conn=Depends(db)):
        with Tx(conn):
            notes.link_task(conn, nid, body.task_id)
        return notes.note_detail(conn, nid)

    @app.delete("/api/notes/{nid}/links/{tid}")
    def unlink_note(nid: int, tid: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM note_task_links WHERE note_id = ? AND task_id = ?", (nid, tid))
        return notes.note_detail(conn, nid)

    @app.get("/api/session/note-tabs")
    def get_tabs(conn=Depends(db)):
        return notes.get_tabs(conn)

    @app.put("/api/session/note-tabs")
    def put_tabs(body: S.NoteTabsIn, conn=Depends(db)):
        with Tx(conn):
            set_value(conn, "note_tabs", {"open": body.open[:50], "active": body.active})
        return notes.get_tabs(conn)

    # ---------------- Vistas de lectura ----------------
    @app.get("/api/today")
    def today(conn=Depends(db)):
        s = st(conn)
        with Tx(conn):
            recurrence.generate(conn, s, today_local(s, now()))
            reminders.refresh(conn, s, now())
        return views.today_view(conn, s, now())

    @app.get("/api/planning")
    def planning(week: Optional[str] = None, conn=Depends(db)):
        s = st(conn)
        return views.week_plan(conn, s, date.fromisoformat(week) if week else today_local(s, now()))

    @app.get("/api/search")
    def do_search(q: str = "", archived: bool = False, trash: bool = False, conn=Depends(db)):
        return search.search(conn, q[:300], archived, trash)

    # ---------------- Recordatorios ----------------
    @app.get("/api/reminders")
    def list_rem(conn=Depends(db)):
        s = st(conn)
        with Tx(conn):
            reminders.refresh(conn, s, now())
        return {"active": reminders.list_active(conn, now()), "scheduled": reminders.upcoming_manual(conn)}

    @app.post("/api/reminders", status_code=201)
    def create_rem(body: S.ManualReminderIn, conn=Depends(db)):
        with Tx(conn):
            rid = reminders.create_manual(conn, body.title, body.due_at, body.task_id, body.project_id)
        return row(conn.execute("SELECT * FROM reminders WHERE id = ?", (rid,)).fetchone())

    @app.post("/api/reminders/{rid}/action")
    def act_rem(rid: int, body: S.ReminderAction, conn=Depends(db)):
        with Tx(conn):
            reminders.act(conn, rid, body.action, body.until)
        return {"ok": True}

    @app.post("/api/reminders/notified")
    def notified(body: dict[str, list[int]], conn=Depends(db)):
        with Tx(conn):
            reminders.mark_notified(conn, [int(i) for i in body.get("ids", [])][:500])
        return {"ok": True}

    # ---------------- Vistas guardadas ----------------
    @app.post("/api/saved-views", status_code=201)
    def create_view(body: S.SavedViewIn, conn=Depends(db)):
        with Tx(conn):
            vid = conn.execute("INSERT INTO saved_views(name, view, filters, created_at) VALUES (?,?,?,?)",
                               (body.name, body.view, jdump(body.filters), now_utc())).lastrowid
        return {"id": vid, "name": body.name, "view": body.view, "filters": body.filters}

    @app.delete("/api/saved-views/{vid}")
    def delete_view(vid: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM saved_views WHERE id = ?", (vid,))
        return {"ok": True}

    # ---------------- Copias, exportación y restauración ----------------
    @app.get("/api/backups")
    def get_backups():
        return {"dir": str(cfg.backup_dir), "items": backup.list_backups(cfg)}

    @app.post("/api/backups", status_code=201)
    def make_backup(conn=Depends(db)):
        return {"name": backup.create_backup(cfg, "manual", st(conn)).name}

    @app.post("/api/backups/{name}/restore")
    def restore_backup(name: str, conn=Depends(db)):
        return backup.restore_from_backup(cfg, name, st(conn))

    def download(content, media: str, filename: str) -> Response:
        return Response(content, media_type=media, headers={"Content-Disposition": f'attachment; filename="{filename}"'})

    def stamp() -> str:
        return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")

    @app.get("/api/export/full")
    def export_full(conn=Depends(db)):
        return download(json.dumps(backup.export_full(conn), ensure_ascii=False, indent=1), "application/json",
                        f"kaosnt-export-completa-{stamp()}.json")

    @app.get("/api/export/project/{pid}")
    def export_project(pid: int, conn=Depends(db)):
        return download(json.dumps(backup.export_project(conn, pid), ensure_ascii=False, indent=1), "application/json",
                        f"kaosnt-proyecto-{pid}-{stamp()}.json")

    @app.get("/api/export/notes.zip")
    def export_notes(conn=Depends(db)):
        return download(backup.export_notes_zip(conn), "application/zip", f"kaosnt-notas-{stamp()}.zip")

    @app.get("/api/export/tasks.csv")
    def export_csv(conn=Depends(db)):
        return download(backup.export_tasks_csv(conn).encode("utf-8"), "text/csv; charset=utf-8", f"kaosnt-tareas-{stamp()}.csv")

    @app.post("/api/restore/preview")
    def restore_preview(body: dict[str, Any], conn=Depends(db)):
        return backup.validate_export(conn, body)

    @app.post("/api/restore")
    def restore(body: S.RestoreIn, conn=Depends(db)):
        if not body.confirm:
            raise invalid("Confirma la restauración: sustituirá todos los datos actuales")
        return backup.restore_from_export(cfg, conn, body.data)

    @app.get("/api/{rest:path}")
    def api_404(rest: str):
        raise not_found("Recurso")

    # ---------------- Frontend compilado ----------------
    if FRONTEND_DIST.exists():
        app.mount("/assets", StaticFiles(directory=FRONTEND_DIST / "assets"), name="assets")

        @app.get("/")
        def index():
            return FileResponse(FRONTEND_DIST / "index.html", headers={"Cache-Control": "no-cache"})
    else:
        @app.get("/")
        def no_front():
            return PlainTextResponse("Falta el frontend compilado (frontend/dist). Consulta el README.", status_code=500)

    return app
