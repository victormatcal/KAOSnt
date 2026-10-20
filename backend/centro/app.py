"""Aplicación FastAPI: API local + frontend compilado. Escucha solo en 127.0.0.1."""
from __future__ import annotations

import logging
import threading
from contextlib import asynccontextmanager
from datetime import date, datetime, timezone
from typing import Any, Callable, Optional

from fastapi import Depends, FastAPI, Request
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse, Response
from fastapi.staticfiles import StaticFiles

from . import __version__, backup, notes, recurrence, reminders, search, tasks, views
from . import schemas as S
from .config import FRONTEND_DIST, Config
from .db import Tx, connect, init_db, jdump, now_utc, row, rows
from .errors import AppError, invalid, not_found
from .settings import EDITABLE, get_all, set_value
from .timeutil import today_local, week_start

log = logging.getLogger("centro")

CSP = ("default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
       "connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; "
       "frame-ancestors 'none'")


def create_app(cfg: Config, clock: Optional[Callable[[], datetime]] = None, background: bool = True,
               extra_hosts: tuple[str, ...] = ()) -> FastAPI:
    cfg.ensure_dirs()
    from . import db as _db
    _db.set_clock(clock)
    first_run = not cfg.db_path.exists()

    def before_migrate(_v: int) -> None:
        backup.create_backup(cfg, "previa-migracion")

    init_db(cfg.db_path, before_migrate)
    allowed_hosts = {f"127.0.0.1:{cfg.port}", f"localhost:{cfg.port}", *extra_hosts}
    allowed_origins = {f"http://127.0.0.1:{cfg.port}", f"http://localhost:{cfg.port}"}
    stop = threading.Event()

    def now() -> datetime:
        return clock() if clock else datetime.now(timezone.utc)

    def maintenance() -> None:
        """Recurrencias, recordatorios y copia diaria. Se ejecuta al abrir y periódicamente."""
        conn = connect(cfg.db_path)
        try:
            st = get_all(conn)
            with Tx(conn):
                recurrence.generate(conn, st, today_local(st, now()))
                reminders.refresh(conn, st, now())
            backup.auto_backup_if_due(cfg, st)
        except Exception:  # no registrar contenido; solo el tipo de error
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
                    conn.execute("INSERT INTO people(name, role, is_me, created_at, updated_at) VALUES (?,?,?,?,?)",
                                 ("Yo", "", 1, ts, ts))
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

    app = FastAPI(title="Centro de trabajo", version=__version__, lifespan=lifespan,
                  docs_url=None, redoc_url=None, openapi_url=None)
    app.state.cfg = cfg
    app.state.server = None
    app.state.maintenance = maintenance
    app.state.first_run = first_run

    # ---------------- Seguridad ----------------
    @app.middleware("http")
    async def security(request: Request, call_next):
        host = request.headers.get("host", "")
        if host not in allowed_hosts:
            return PlainTextResponse("Host no permitido", status_code=421)
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            origin = request.headers.get("origin")
            if origin is not None and origin not in allowed_origins:
                return JSONResponse({"code": "origen", "message": "Origen no permitido"}, status_code=403)
            site = request.headers.get("sec-fetch-site")
            if site is not None and site not in ("same-origin", "none"):
                return JSONResponse({"code": "origen", "message": "Origen no permitido"}, status_code=403)
            if request.headers.get("x-centro") != "1":
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
        # Solo se registra el tipo y la traza técnica, nunca el cuerpo de la petición
        log.error("Error inesperado: %s", type(exc).__name__, exc_info=exc)
        return JSONResponse({"code": "error_interno",
                             "message": "Error interno: la operación no se ha completado. "
                                        "reintenta y, si persiste, reinicia la aplicación y revisa la consola."},
                            status_code=500)

    from fastapi.exceptions import RequestValidationError

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

    # ---------------- Sistema ----------------
    @app.get("/api/health")
    def health():
        return {"ok": True, "app": "centro-trabajo", "version": __version__}

    @app.get("/api/bootstrap")
    def bootstrap(conn=Depends(db)):
        return {
            "version": __version__, "demo": cfg.demo, "data_dir": str(cfg.data_dir),
            "settings": st(conn), "me_id": views.me_id(conn),
            "people": rows(conn.execute("SELECT * FROM people ORDER BY is_me DESC, active DESC, name")),
            "clients": rows(conn.execute("SELECT * FROM clients ORDER BY name")),
            "projects": views.list_projects(conn, include_archived=True),
            "tags": [r["name"] for r in conn.execute("SELECT name FROM tags ORDER BY name")],
            "saved_views": [{**v, "filters": __import__("json").loads(v["filters"])}
                            for v in rows(conn.execute("SELECT * FROM saved_views ORDER BY name"))],
            "groupings": rows(conn.execute("SELECT * FROM groupings ORDER BY project_id, kind, position, id")),
        }

    @app.post("/api/system/shutdown")
    def shutdown():
        server = app.state.server
        if server is None:
            raise AppError(409, "sin_servidor", "El cierre controlado solo está disponible al ejecutar la aplicación")
        server.should_exit = True
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
        if "holidays" in body:
            for d in body["holidays"]:
                date.fromisoformat(d)
        with Tx(conn):
            for k, v in body.items():
                set_value(conn, k, v)
        return st(conn)

    # ---------------- Clientes ----------------
    @app.get("/api/clients")
    def list_clients(conn=Depends(db)):
        return rows(conn.execute("SELECT * FROM clients ORDER BY name"))

    @app.post("/api/clients", status_code=201)
    def create_client(body: S.ClientIn, conn=Depends(db)):
        ts = now_utc()
        with Tx(conn):
            cid = conn.execute("INSERT INTO clients(name, notes, created_at, updated_at) VALUES (?,?,?,?)",
                               (body.name.strip(), body.notes, ts, ts)).lastrowid
        return row(conn.execute("SELECT * FROM clients WHERE id = ?", (cid,)).fetchone())

    @app.patch("/api/clients/{cid}")
    def patch_client(cid: int, body: S.ClientPatch, conn=Depends(db)):
        return _patch_simple(conn, "clients", cid, dump(body), "Cliente")

    @app.delete("/api/clients/{cid}")
    def delete_client(cid: int, conn=Depends(db)):
        with Tx(conn):
            if not conn.execute("DELETE FROM clients WHERE id = ?", (cid,)).rowcount:
                raise not_found("Cliente")
        return {"ok": True}

    def _patch_simple(conn, table: str, id_: int, data: dict[str, Any], label: str):
        if not conn.execute(f"SELECT 1 FROM {table} WHERE id = ?", (id_,)).fetchone():
            raise not_found(label)
        if data:
            data["updated_at"] = now_utc()
            with Tx(conn):
                conn.execute(f"UPDATE {table} SET {', '.join(f'{k} = ?' for k in data)} WHERE id = ?",
                             [*data.values(), id_])
        return row(conn.execute(f"SELECT * FROM {table} WHERE id = ?", (id_,)).fetchone())

    # ---------------- Personas y ausencias ----------------
    @app.get("/api/people")
    def list_people(conn=Depends(db)):
        return rows(conn.execute("SELECT * FROM people ORDER BY is_me DESC, active DESC, name"))

    @app.post("/api/people", status_code=201)
    def create_person(body: S.PersonIn, conn=Depends(db)):
        ts = now_utc()
        with Tx(conn):
            pid = conn.execute(
                "INSERT INTO people(name, role, weekly_capacity_hours, active, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
                (body.name.strip(), body.role, body.weekly_capacity_hours, 1 if body.active else 0, body.notes, ts, ts)).lastrowid
        return row(conn.execute("SELECT * FROM people WHERE id = ?", (pid,)).fetchone())

    @app.patch("/api/people/{pid}")
    def patch_person(pid: int, body: S.PersonPatch, conn=Depends(db)):
        d = dump(body)
        if "active" in d:
            d["active"] = 1 if d["active"] else 0
        return _patch_simple(conn, "people", pid, d, "Persona")

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
        if not conn.execute("SELECT 1 FROM people WHERE id = ?", (body.person_id,)).fetchone():
            raise invalid("Persona no existe")
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
        if d.get("client_id") and not conn.execute("SELECT 1 FROM clients WHERE id = ?", (d["client_id"],)).fetchone():
            raise invalid("Cliente no existe")
        ts = now_utc()
        d["links"] = jdump(d["links"])
        d.update(created_at=ts, updated_at=ts, summary_updated_at=ts if d["summary"] else None)
        with Tx(conn):
            pid = conn.execute(f"INSERT INTO projects({','.join(d)}) VALUES ({','.join('?' for _ in d)})",
                               list(d.values())).lastrowid
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
        if d.get("client_id") and not conn.execute("SELECT 1 FROM clients WHERE id = ?", (d["client_id"],)).fetchone():
            raise invalid("Cliente no existe")
        if "links" in d:
            d["links"] = jdump(d["links"] or [])
        for k in ("summary", "next_action", "objective", "phase", "health_note"):
            if k in d and d[k] is None:
                d[k] = ""
        if "summary" in d and d["summary"] != cur["summary"]:
            d["summary_updated_at"] = now_utc()
        _patch_simple(conn, "projects", pid, d, "Proyecto")
        return views.project_overview(conn, pid, st(conn), now())

    @app.post("/api/projects/{pid}/people")
    def add_project_person(pid: int, body: S.ProjectPersonIn, conn=Depends(db)):
        if not conn.execute("SELECT 1 FROM projects WHERE id = ?", (pid,)).fetchone():
            raise not_found("Proyecto")
        if not conn.execute("SELECT 1 FROM people WHERE id = ?", (body.person_id,)).fetchone():
            raise invalid("Persona no existe")
        with Tx(conn):
            conn.execute("INSERT INTO project_people(project_id, person_id, role) VALUES (?,?,?) "
                         "ON CONFLICT(project_id, person_id) DO UPDATE SET role = excluded.role",
                         (pid, body.person_id, body.role))
        return {"ok": True}

    @app.delete("/api/projects/{pid}/people/{person_id}")
    def remove_project_person(pid: int, person_id: int, conn=Depends(db)):
        with Tx(conn):
            conn.execute("DELETE FROM project_people WHERE project_id = ? AND person_id = ?", (pid, person_id))
        return {"ok": True}

    @app.post("/api/projects/{pid}/groupings", status_code=201)
    def create_grouping(pid: int, body: S.GroupingIn, conn=Depends(db)):
        if not conn.execute("SELECT 1 FROM projects WHERE id = ?", (pid,)).fetchone():
            raise not_found("Proyecto")
        with Tx(conn):
            gid = conn.execute("INSERT INTO groupings(project_id, kind, name, position) VALUES (?,?,?,?)",
                               (pid, body.kind, body.name.strip(), body.position)).lastrowid
        return row(conn.execute("SELECT * FROM groupings WHERE id = ?", (gid,)).fetchone())

    @app.patch("/api/groupings/{gid}")
    def patch_grouping(gid: int, body: S.GroupingPatch, conn=Depends(db)):
        d = dump(body)
        if not conn.execute("SELECT 1 FROM groupings WHERE id = ?", (gid,)).fetchone():
            raise not_found("Agrupación")
        if d:
            with Tx(conn):
                conn.execute(f"UPDATE groupings SET {', '.join(f'{k} = ?' for k in d)} WHERE id = ?", [*d.values(), gid])
        return row(conn.execute("SELECT * FROM groupings WHERE id = ?", (gid,)).fetchone())

    @app.delete("/api/groupings/{gid}")
    def delete_grouping(gid: int, conn=Depends(db)):
        with Tx(conn):  # las tareas se conservan; solo pierden la agrupación
            conn.execute("DELETE FROM groupings WHERE id = ?", (gid,))
        return {"ok": True}

    @app.post("/api/projects/{pid}/milestones", status_code=201)
    def create_milestone(pid: int, body: S.MilestoneIn, conn=Depends(db)):
        if not conn.execute("SELECT 1 FROM projects WHERE id = ?", (pid,)).fetchone():
            raise not_found("Proyecto")
        ts = now_utc()
        with Tx(conn):
            mid = conn.execute(
                "INSERT INTO milestones(project_id, kind, title, date, status, notes, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?)",
                (pid, body.kind, body.title, body.date, body.status, body.notes, ts, ts)).lastrowid
        return row(conn.execute("SELECT * FROM milestones WHERE id = ?", (mid,)).fetchone())

    @app.patch("/api/milestones/{mid}")
    def patch_milestone(mid: int, body: S.MilestonePatch, conn=Depends(db)):
        return _patch_simple(conn, "milestones", mid, dump(body), "Hito")

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
        return tasks.task_detail(conn, tid)

    @app.get("/api/tasks/{tid}")
    def get_task(tid: int, conn=Depends(db)):
        # Solo lectura: abrir una tarea nunca modifica su seguimiento
        return tasks.task_detail(conn, tid)

    @app.patch("/api/tasks/{tid}")
    def patch_task(tid: int, body: S.TaskPatch, conn=Depends(db)):
        with Tx(conn):
            tasks.update_task(conn, tid, dump(body))
        return tasks.task_detail(conn, tid)

    @app.delete("/api/tasks/{tid}")
    def delete_task(tid: int, conn=Depends(db)):
        t = tasks.get_task_row(conn, tid)
        if not t["archived"]:
            raise invalid("Archiva la tarea antes de eliminarla definitivamente")
        with Tx(conn):
            conn.execute("DELETE FROM tasks WHERE id = ?", (tid,))
        return {"ok": True}

    @app.post("/api/tasks/{tid}/update")
    def task_update_note(tid: int, body: S.TaskUpdateNote, conn=Depends(db)):
        with Tx(conn):
            tasks.record_update(conn, tid, body.text)
        return tasks.task_detail(conn, tid)

    @app.post("/api/tasks/{tid}/follow-up")
    def task_follow_up(tid: int, body: S.FollowUpIn, conn=Depends(db)):
        with Tx(conn):
            tasks.record_follow_up(conn, tid, body.text)
        return tasks.task_detail(conn, tid)

    @app.post("/api/tasks/{tid}/dependencies")
    def add_dep(tid: int, body: S.DependencyIn, conn=Depends(db)):
        with Tx(conn):
            tasks.add_dependency(conn, tid, body.depends_on_id)
        return tasks.task_detail(conn, tid)

    @app.delete("/api/tasks/{tid}/dependencies/{dep}")
    def del_dep(tid: int, dep: int, conn=Depends(db)):
        with Tx(conn):
            tasks.remove_dependency(conn, tid, dep)
        return tasks.task_detail(conn, tid)

    @app.post("/api/tasks/{tid}/reorder")
    def reorder(tid: int, body: S.ReorderIn, conn=Depends(db)):
        with Tx(conn):
            tasks.reorder(conn, tid, body.status, body.before_id, body.after_id, body.force)
        return tasks.task_detail(conn, tid)

    @app.put("/api/tasks/{tid}/allocations")
    def put_alloc(tid: int, body: S.AllocationIn, conn=Depends(db)):
        with Tx(conn):
            tasks.set_allocation(conn, tid, body.week_start, body.hours)
        return tasks.task_detail(conn, tid)

    @app.post("/api/tasks/{tid}/skip")
    def skip(tid: int, conn=Depends(db)):
        with Tx(conn):
            recurrence.skip_occurrence(conn, tid)
        return tasks.task_detail(conn, tid)

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
        return tasks.task_detail(conn, tid)

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
        d = date.fromisoformat(week) if week else today_local(s, now())
        return views.week_plan(conn, s, d)

    @app.get("/api/search")
    def do_search(q: str = "", archived: bool = False, trash: bool = False, conn=Depends(db)):
        return search.search(conn, q[:300], archived, trash)

    @app.get("/api/tags")
    def list_tags(conn=Depends(db)):
        return [r["name"] for r in conn.execute("SELECT name FROM tags ORDER BY name")]

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
        p = backup.create_backup(cfg, "manual", st(conn))
        return {"name": p.name}

    @app.post("/api/backups/{name}/restore")
    def restore_backup(name: str, conn=Depends(db)):
        return backup.restore_from_backup(cfg, name, st(conn))

    def _download(content, media: str, filename: str) -> Response:
        return Response(content, media_type=media,
                        headers={"Content-Disposition": f'attachment; filename="{filename}"'})

    def _stamp() -> str:
        return datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S")

    @app.get("/api/export/full")
    def export_full(conn=Depends(db)):
        import json
        return _download(json.dumps(backup.export_full(conn), ensure_ascii=False, indent=1),
                         "application/json", f"centro-export-completa-{_stamp()}.json")

    @app.get("/api/export/project/{pid}")
    def export_project(pid: int, conn=Depends(db)):
        import json
        return _download(json.dumps(backup.export_project(conn, pid), ensure_ascii=False, indent=1),
                         "application/json", f"centro-proyecto-{pid}-{_stamp()}.json")

    @app.get("/api/export/notes.zip")
    def export_notes(conn=Depends(db)):
        return _download(backup.export_notes_zip(conn), "application/zip", f"centro-notas-{_stamp()}.zip")

    @app.get("/api/export/tasks.csv")
    def export_csv(conn=Depends(db)):
        return _download(backup.export_tasks_csv(conn).encode("utf-8"), "text/csv; charset=utf-8",
                         f"centro-tareas-{_stamp()}.csv")

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
