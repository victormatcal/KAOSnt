"""Copias de seguridad, exportación y restauración.

- Copias: API de copia en línea de SQLite (consistente aunque la base esté abierta). Nunca se copia
  el archivo a ciegas.
- Exportación completa: JSON estructurado y versionado (formato «centro-trabajo», versión 1).
- Restauración: completa (sin fusión). Se valida formato y versión, se muestra un resumen, se crea
  una copia previa, se restaura en una transacción y se comprueban relaciones e integridad.
"""
from __future__ import annotations

import csv
import io
import re
import sqlite3
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from . import __version__
from .config import Config
from .db import connect, jload, latest_version, migrate, now_utc, rows, schema_version
from .errors import AppError, invalid, not_found
from .notes import display_title
from .settings import get_all
from .timeutil import tz_of

FORMAT = "centro-trabajo"
FORMAT_VERSION = 1
# Orden de inserción (padres antes que hijos)
TABLES = [
    "clients", "people", "projects", "project_people", "groupings", "milestones", "recurrences", "tasks",
    "task_dependencies", "task_history", "task_allocations", "notes", "note_task_links", "tags", "task_tags",
    "note_tags", "absences", "reminders", "saved_views", "settings",
]
BACKUP_RE = re.compile(r"^centro-\d{8}-\d{6}(-\d+)?-(manual|auto|previa-restauracion|previa-migracion)\.db$")


# ---------------- Copias ----------------
def _stamp(settings: dict[str, Any] | None) -> str:
    tz = tz_of(settings or {})
    return datetime.now(timezone.utc).astimezone(tz).strftime("%Y%m%d-%H%M%S")


def create_backup(cfg: Config, reason: str, settings: dict[str, Any] | None = None) -> Path:
    cfg.ensure_dirs()
    base = f"centro-{_stamp(settings)}"
    path = cfg.backup_dir / f"{base}-{reason}.db"
    i = 1
    while path.exists():
        path = cfg.backup_dir / f"{base}-{i}-{reason}.db"
        i += 1
    src = connect(cfg.db_path)
    dst = sqlite3.connect(str(path))
    try:
        src.backup(dst)
    finally:
        dst.close()
        src.close()
    chk = sqlite3.connect(str(path))
    try:
        if chk.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise AppError(500, "copia_corrupta", "La copia creada no supera la comprobación de integridad")
    finally:
        chk.close()
    return path


def list_backups(cfg: Config) -> list[dict[str, Any]]:
    out = []
    if cfg.backup_dir.exists():
        for f in sorted(cfg.backup_dir.glob("centro-*.db"), reverse=True):
            if BACKUP_RE.match(f.name):
                st = f.stat()
                out.append({"name": f.name, "size": st.st_size, "reason": f.name.rsplit("-", 1)[-1][:-3]
                            if not f.name.endswith(("previa-restauracion.db", "previa-migracion.db"))
                            else ("previa-restauracion" if "restauracion" in f.name else "previa-migracion"),
                            "modified": datetime.fromtimestamp(st.st_mtime, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")})
    return out


def auto_backup_if_due(cfg: Config, settings: dict[str, Any]) -> Path | None:
    today = datetime.now(timezone.utc).astimezone(tz_of(settings)).strftime("%Y%m%d")
    if any(cfg.backup_dir.glob(f"centro-{today}-*-auto.db")):
        return None
    path = create_backup(cfg, "auto", settings)
    prune(cfg, int(settings.get("backup_retention") or 14))
    return path


def prune(cfg: Config, keep: int) -> int:
    autos = sorted(cfg.backup_dir.glob("centro-*-auto.db"), reverse=True)
    removed = 0
    for f in autos[max(keep, 1):]:
        f.unlink(missing_ok=True)
        removed += 1
    return removed


def restore_from_backup(cfg: Config, name: str, settings: dict[str, Any]) -> dict[str, Any]:
    if not BACKUP_RE.match(name):
        raise invalid("Nombre de copia no válido")
    path = (cfg.backup_dir / name).resolve()
    if path.parent != cfg.backup_dir.resolve() or not path.exists():
        raise not_found("Copia")
    src = sqlite3.connect(f"file:{path}?mode=ro", uri=True)
    try:
        if src.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
            raise invalid("La copia no supera la comprobación de integridad")
        v = src.execute("PRAGMA user_version").fetchone()[0]
        if v < 1 or v > latest_version():
            raise invalid(f"Versión de esquema no compatible ({v})")
        previous = create_backup(cfg, "previa-restauracion", settings)
        dst = connect(cfg.db_path)
        try:
            src.backup(dst)
            migrate(dst)
            if dst.execute("PRAGMA foreign_key_check").fetchall():
                raise AppError(500, "relaciones", "La copia restaurada tiene relaciones inconsistentes; "
                                                  f"se conserva la copia previa {previous.name}")
        finally:
            dst.close()
    finally:
        src.close()
    return {"restored": name, "previous_backup": previous.name}


# ---------------- Exportación ----------------
def export_full(conn: sqlite3.Connection) -> dict[str, Any]:
    return {
        "format": FORMAT, "kind": "completa", "format_version": FORMAT_VERSION,
        "schema_version": schema_version(conn), "app_version": __version__, "exported_at": now_utc(),
        "tables": {t: rows(conn.execute(f"SELECT * FROM {t}")) for t in TABLES},
    }


def export_project(conn: sqlite3.Connection, project_id: int) -> dict[str, Any]:
    p = conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()
    if not p:
        raise not_found("Proyecto")
    q = lambda sql, *a: rows(conn.execute(sql, a))  # noqa: E731
    tasks = q("SELECT * FROM tasks WHERE project_id = ?", project_id)
    tids = [t["id"] for t in tasks] or [-1]
    ph = ",".join("?" for _ in tids)
    notes = rows(conn.execute(
        f"""SELECT * FROM notes WHERE project_id = ? OR id IN (SELECT note_id FROM note_task_links WHERE task_id IN ({ph}))""",
        [project_id, *tids]))
    nids = [n["id"] for n in notes] or [-1]
    nph = ",".join("?" for _ in nids)
    people_ids = {r["person_id"] for r in conn.execute("SELECT person_id FROM project_people WHERE project_id = ?", (project_id,))}
    for t in tasks:
        people_ids.update(x for x in (t["assignee_id"], t["reviewer_id"], t["wait_on_person_id"]) if x)
    pids = list(people_ids) or [-1]
    return {
        "format": FORMAT, "kind": "proyecto", "format_version": FORMAT_VERSION,
        "schema_version": schema_version(conn), "app_version": __version__, "exported_at": now_utc(),
        "note": "Exportación de consulta de un proyecto. La restauración solo admite exportaciones completas.",
        "tables": {
            "projects": [dict(p)],
            "clients": q("SELECT * FROM clients WHERE id = ?", p["client_id"]) if p["client_id"] else [],
            "people": rows(conn.execute(f"SELECT * FROM people WHERE id IN ({','.join('?' for _ in pids)})", pids)),
            "project_people": q("SELECT * FROM project_people WHERE project_id = ?", project_id),
            "groupings": q("SELECT * FROM groupings WHERE project_id = ?", project_id),
            "milestones": q("SELECT * FROM milestones WHERE project_id = ?", project_id),
            "recurrences": q("SELECT * FROM recurrences WHERE project_id = ?", project_id),
            "tasks": tasks,
            "task_dependencies": rows(conn.execute(
                f"SELECT * FROM task_dependencies WHERE task_id IN ({ph}) OR depends_on_id IN ({ph})", tids + tids)),
            "task_history": rows(conn.execute(f"SELECT * FROM task_history WHERE task_id IN ({ph})", tids)),
            "task_allocations": rows(conn.execute(f"SELECT * FROM task_allocations WHERE task_id IN ({ph})", tids)),
            "task_tags": rows(conn.execute(f"SELECT * FROM task_tags WHERE task_id IN ({ph})", tids)),
            "notes": notes,
            "note_task_links": rows(conn.execute(f"SELECT * FROM note_task_links WHERE note_id IN ({nph})", nids)),
            "note_tags": rows(conn.execute(f"SELECT * FROM note_tags WHERE note_id IN ({nph})", nids)),
            "tags": q("SELECT * FROM tags"),
        },
    }


def _slug(s: str) -> str:
    s = re.sub(r"[^\w\s-]", "", s, flags=re.UNICODE).strip().lower()
    return re.sub(r"[\s_-]+", "-", s)[:50] or "nota"


def export_notes_zip(conn: sqlite3.Connection, include_trash: bool = False) -> bytes:
    tz_name = get_all(conn)["timezone"]
    projects = {r["id"]: r["name"] for r in conn.execute("SELECT id, name FROM projects")}
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as z:
        q = "SELECT * FROM notes" + ("" if include_trash else " WHERE state <> 'papelera'") + " ORDER BY id"
        for n in rows(conn.execute(q)):
            title = display_title(n, tz_name)
            front = [
                "---", f"id: {n['id']}", f"titulo: \"{title.replace(chr(34), chr(39))}\"",
                f"proyecto: \"{projects.get(n['project_id'], '')}\"", f"tipo: {n['kind'] or ''}",
                f"estado: {n['state']}", f"creada: {n['created_at']}", f"actualizada: {n['updated_at']}", "---", "",
            ]
            folder = {"activa": "notas", "archivada": "archivo", "papelera": "papelera"}[n["state"]]
            z.writestr(f"{folder}/{n['id']:05d}-{_slug(title)}.md", "\n".join(front) + n["content"])
    return buf.getvalue()


def _csv_safe(v: Any) -> Any:
    if isinstance(v, str) and v[:1] in ("=", "+", "-", "@", "\t", "\r"):
        return "'" + v  # evita inyección de fórmulas al abrir en Excel
    return v


def export_tasks_csv(conn: sqlite3.Connection) -> str:
    q = """SELECT t.id, t.title AS titulo, p.name AS proyecto, t.status AS estado, t.condition AS condicion,
                  t.priority AS prioridad, a.name AS responsable, r.name AS revisor, t.due_date AS fecha_limite,
                  t.planned_date AS fecha_planificada, t.started_at AS inicio, t.completed_at AS fin,
                  t.estimate_hours AS esfuerzo_estimado_h, t.approval AS aprobacion, t.kind AS tipo,
                  t.wait_on AS depende_de_tercero, t.last_significant_update AS ultima_actualizacion,
                  t.archived AS archivada
           FROM tasks t LEFT JOIN projects p ON p.id = t.project_id LEFT JOIN people a ON a.id = t.assignee_id
           LEFT JOIN people r ON r.id = t.reviewer_id ORDER BY t.id"""
    data = rows(conn.execute(q))
    out = io.StringIO()
    out.write("\ufeff")  # BOM para que Excel detecte UTF-8
    cols = list(data[0].keys()) if data else ["id", "titulo"]
    w = csv.writer(out, delimiter=";", lineterminator="\r\n")
    w.writerow(cols)
    for r in data:
        w.writerow([_csv_safe("" if r[c] is None else r[c]) for c in cols])
    return out.getvalue()


# ---------------- Restauración desde exportación completa ----------------
def _table_columns(conn, table: str) -> list[str]:
    return [r["name"] for r in conn.execute(f"PRAGMA table_info({table})")]


def validate_export(conn: sqlite3.Connection, data: dict[str, Any]) -> dict[str, Any]:
    if data.get("format") != FORMAT:
        raise invalid("El archivo no es una exportación de Centro de trabajo")
    if data.get("kind") != "completa":
        raise invalid("Solo se pueden restaurar exportaciones completas (no por proyecto)")
    if data.get("format_version") != FORMAT_VERSION:
        raise invalid(f"Versión de formato no compatible: {data.get('format_version')}")
    if data.get("schema_version") != schema_version(conn):
        raise invalid(f"La exportación es del esquema {data.get('schema_version')} y la base actual del "
                      f"{schema_version(conn)}. Restaura con la misma versión de la aplicación.")
    tables = data.get("tables")
    if not isinstance(tables, dict):
        raise invalid("Estructura de tablas no válida")
    unknown = set(tables) - set(TABLES)
    if unknown:
        raise invalid(f"Tablas desconocidas: {', '.join(sorted(unknown))}")
    counts = {}
    for t in TABLES:
        items = tables.get(t, [])
        if not isinstance(items, list) or any(not isinstance(r, dict) for r in items):
            raise invalid(f"Datos no válidos en {t}")
        cols = set(_table_columns(conn, t))
        for r in items:
            extra = set(r) - cols
            if extra:
                raise invalid(f"Columnas desconocidas en {t}: {', '.join(sorted(extra))}")
        counts[t] = len(items)
    current = {t: conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0] for t in TABLES}
    return {"valid": True, "exported_at": data.get("exported_at"), "app_version": data.get("app_version"),
            "incoming": counts, "current": current}


def restore_from_export(cfg: Config, conn: sqlite3.Connection, data: dict[str, Any]) -> dict[str, Any]:
    summary = validate_export(conn, data)
    previous = create_backup(cfg, "previa-restauracion", get_all(conn))
    conn.execute("PRAGMA foreign_keys = OFF")
    try:
        conn.execute("BEGIN IMMEDIATE")
        try:
            for t in reversed(TABLES):
                conn.execute(f"DELETE FROM {t}")
            for t in TABLES:
                for r in data["tables"].get(t, []):
                    cols = list(r.keys())
                    conn.execute(f"INSERT INTO {t}({','.join(cols)}) VALUES ({','.join('?' for _ in cols)})",
                                 [r[c] for c in cols])
            bad = conn.execute("PRAGMA foreign_key_check").fetchall()
            if bad:
                raise invalid(f"La exportación contiene {len(bad)} relaciones rotas; no se ha restaurado nada")
            if conn.execute("PRAGMA integrity_check").fetchone()[0] != "ok":
                raise invalid("Fallo de integridad tras restaurar; no se ha restaurado nada")
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
    finally:
        conn.execute("PRAGMA foreign_keys = ON")
    return {**summary, "previous_backup": previous.name}
