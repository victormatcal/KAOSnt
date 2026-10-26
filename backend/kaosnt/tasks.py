"""Task logic: creation, significant changes, waiting/blocked condition, dependencies
(no cycles), steps, short history (editable manual updates), tags and weekly split."""
from __future__ import annotations

import sqlite3
from datetime import date
from typing import Any

from .db import jdump, jload, now_utc, row, rows
from .errors import AppError, invalid, missing_ref, not_found

STATUS_LABEL = {
    "backlog": "Backlog", "pendiente": "Pendiente", "en_curso": "En curso",
    "en_revision": "En revisión", "hecha": "Hecha", "cancelada": "Cancelada",
}
CONDITION_LABEL = {None: "sin condición", "espera": "En espera", "bloqueada": "Bloqueada"}

# Changes that count as a «significant update». Opening, reordering, priority or dates do NOT.
SIGNIFICANT_FIELDS = {"status", "condition", "description"}

HISTORY_FIELDS = {
    "title": "Título", "status": "Estado", "condition": "Condición", "assignee_id": "Responsable",
    "reviewer_id": "Revisor", "due_date": "Fecha límite", "planned_date": "Fecha planificada",
    "priority": "Prioridad", "approval": "Aprobación", "project_id": "Proyecto", "parent_id": "Tarea principal",
    "estimate_hours": "Esfuerzo estimado", "archived": "Archivada",
}
# History entry kinds: 'cambio' (automatic, not editable), 'actualizacion' (manual, editable),
# 'seguimiento' (explicit «follow-up done» action).
EDITABLE_HISTORY = {"actualizacion"}

TASK_COLUMNS = {
    "title", "description", "kind", "project_id", "workstream_id", "phase_id", "deliverable_id",
    "parent_id", "assignee_id", "reviewer_id", "status", "priority", "position", "due_date",
    "planned_date", "started_at", "completed_at", "estimate_hours", "approval", "condition",
    "wait_reason", "wait_on", "wait_on_person_id", "wait_since", "wait_next_action", "follow_up_at",
    "follow_up_every_days", "next_review_at", "review_after_start_hours", "review_after_idle_hours",
    "review_hours_mode", "links", "archived",
}
NOT_NULL_DEFAULTS = {
    "description": "", "kind": "tarea", "status": "pendiente", "priority": "normal", "approval": "no_requerida",
    "wait_reason": "", "wait_on": "", "wait_next_action": "", "review_hours_mode": "natural", "archived": 0,
}


def _exists(conn, table: str, id_: int | None) -> bool:
    return id_ is None or conn.execute(f"SELECT 1 FROM {table} WHERE id = ?", (id_,)).fetchone() is not None


def get_task_row(conn: sqlite3.Connection, task_id: int) -> dict[str, Any]:
    t = row(conn.execute("SELECT * FROM tasks WHERE id = ?", (task_id,)).fetchone())
    if not t:
        raise not_found("Tarea")
    return t


def _validate_refs(conn, data: dict[str, Any], task_id: int | None, project_id: int | None) -> None:
    for field, table, label in (
        ("project_id", "projects", "Proyecto"), ("assignee_id", "people", "Responsable"),
        ("reviewer_id", "people", "Revisor"), ("wait_on_person_id", "people", "Persona de la que depende"),
        ("parent_id", "tasks", "Tarea principal"),
    ):
        if field in data and not _exists(conn, table, data[field]):
            raise missing_ref(label)
    for field, kind in (("workstream_id", "linea"), ("phase_id", "fase"), ("deliverable_id", "entregable")):
        gid = data.get(field)
        if gid is not None:
            g = conn.execute("SELECT project_id, kind FROM groupings WHERE id = ?", (gid,)).fetchone()
            if not g or g["kind"] != kind:
                raise invalid("Agrupación no válida")
            if project_id is None or g["project_id"] != project_id:
                raise invalid("La agrupación pertenece a otro proyecto")
    pid = data.get("parent_id")
    if pid is not None and task_id is not None:
        cur, seen = pid, set()
        while cur is not None and cur not in seen:
            if cur == task_id:
                raise invalid("Una tarea no puede ser subtarea de sí misma ni de sus subtareas", "ciclo")
            seen.add(cur)
            r = conn.execute("SELECT parent_id FROM tasks WHERE id = ?", (cur,)).fetchone()
            cur = r["parent_id"] if r else None


def add_history(conn, task_id: int, kind: str, text: str, at: str | None = None) -> None:
    conn.execute("INSERT INTO task_history(task_id, at, kind, text) VALUES (?, ?, ?, ?)",
                 (task_id, at or now_utc(), kind, text[:5000]))


# ---------- Tags (unique reusable objects) ----------
def set_tags(conn, table: str, owner_col: str, owner_id: int, names: list[str]) -> None:
    conn.execute(f"DELETE FROM {table} WHERE {owner_col} = ?", (owner_id,))
    seen: set[str] = set()
    for name in names:
        n = " ".join(name.split())
        if not n or n.lower() in seen:
            continue
        seen.add(n.lower())
        conn.execute("INSERT OR IGNORE INTO tags(name) VALUES (?)", (n,))
        tag_id = conn.execute("SELECT id FROM tags WHERE name = ?", (n,)).fetchone()["id"]
        conn.execute(f"INSERT OR IGNORE INTO {table}({owner_col}, tag_id) VALUES (?, ?)", (owner_id, tag_id))


def list_tags(conn) -> list[dict[str, Any]]:
    return rows(conn.execute(
        """SELECT g.id, g.name, (SELECT COUNT(*) FROM task_tags t WHERE t.tag_id = g.id) AS tasks,
                  (SELECT COUNT(*) FROM note_tags n WHERE n.tag_id = g.id) AS notes
           FROM tags g ORDER BY g.name COLLATE NOCASE"""))


def rename_tag(conn, tag_id: int, name: str) -> None:
    """Rename; if another tag with that name already exists, merge them."""
    if not conn.execute("SELECT 1 FROM tags WHERE id = ?", (tag_id,)).fetchone():
        raise not_found("Etiqueta")
    name = " ".join(name.split())
    other = conn.execute("SELECT id FROM tags WHERE name = ? AND id <> ?", (name, tag_id)).fetchone()
    if other:
        for t in ("task_tags", "note_tags"):
            conn.execute(f"UPDATE OR IGNORE {t} SET tag_id = ? WHERE tag_id = ?", (other["id"], tag_id))
        conn.execute("DELETE FROM tags WHERE id = ?", (tag_id,))
    else:
        conn.execute("UPDATE tags SET name = ? WHERE id = ?", (name, tag_id))


def _next_position(conn, status: str) -> float:
    r = conn.execute("SELECT MAX(position) AS m FROM tasks WHERE status = ?", (status,)).fetchone()
    return (r["m"] or 0) + 1


def create_task(conn: sqlite3.Connection, data: dict[str, Any], history_note: str = "Creada") -> int:
    data = {k: v for k, v in data.items() if k in TASK_COLUMNS or k == "tags"}
    tags = data.pop("tags", None)
    for k, default in NOT_NULL_DEFAULTS.items():
        if data.get(k) is None:
            data[k] = default
    if "links" in data:
        data["links"] = jdump(data["links"] or [])
    _validate_refs(conn, data, None, data.get("project_id"))
    ts = now_utc()
    if data["status"] == "en_curso" and not data.get("started_at"):
        data["started_at"] = ts
    if data["status"] == "hecha" and not data.get("completed_at"):
        data["completed_at"] = ts
    if data.get("condition") and not data.get("wait_since"):
        data["wait_since"] = ts
    if data.get("position") is None:
        data["position"] = _next_position(conn, data["status"])
    data["archived"] = 1 if data.get("archived") else 0
    data.update(created_at=ts, updated_at=ts, last_significant_update=ts)
    cur = conn.execute(f"INSERT INTO tasks({', '.join(data)}) VALUES ({', '.join('?' for _ in data)})",
                       list(data.values()))
    tid = cur.lastrowid
    if tags:
        set_tags(conn, "task_tags", "task_id", tid, tags)
    add_history(conn, tid, "cambio", history_note, ts)
    return tid


def _fmt(v: Any) -> str:
    return "—" if v is None or v == "" else str(v)


def _name(conn, table: str, col: str, id_):
    if id_ is None:
        return None
    r = conn.execute(f"SELECT {col} FROM {table} WHERE id = ?", (id_,)).fetchone()
    return r[0] if r else "(eliminado)"


def update_task(conn: sqlite3.Connection, task_id: int, patch: dict[str, Any]) -> dict[str, Any]:
    """Apply changes. Statuses never change because of dependencies; priority never changes by itself."""
    force = bool(patch.pop("force", False))
    tags = patch.pop("tags", None)
    t = get_task_row(conn, task_id)
    patch = {k: v for k, v in patch.items() if k in TASK_COLUMNS}
    for k, default in NOT_NULL_DEFAULTS.items():
        if k in patch and patch[k] is None:
            patch[k] = default
    if "links" in patch:
        patch["links"] = jdump(patch["links"] or [])
    if "archived" in patch:
        patch["archived"] = 1 if patch["archived"] else 0
    project_id = patch.get("project_id", t["project_id"])
    if "project_id" in patch and patch["project_id"] != t["project_id"]:
        for g in ("workstream_id", "phase_id", "deliverable_id"):
            patch.setdefault(g, None)
    _validate_refs(conn, patch, task_id, project_id)

    ts = now_utc()
    new_status = patch.get("status", t["status"])
    approval = patch.get("approval", t["approval"])
    if (new_status == "en_curso" and t["status"] != "en_curso"
            and approval in ("pendiente", "rechazada") and not force):
        raise AppError(409, "aprobacion_pendiente",
                       "La aprobación comercial de esta tarea está pendiente. ¿Quieres iniciar la ejecución igualmente?"
                       if approval == "pendiente" else
                       "La aprobación comercial de esta tarea está rechazada. ¿Quieres iniciar la ejecución igualmente?")
    if "status" in patch and patch["status"] != t["status"]:
        if new_status == "en_curso" and not t["started_at"] and "started_at" not in patch:
            patch["started_at"] = ts
        if new_status == "hecha" and "completed_at" not in patch:
            patch["completed_at"] = ts
        if t["status"] == "hecha" and new_status != "hecha" and "completed_at" not in patch:
            patch["completed_at"] = None
        if "position" not in patch:
            patch["position"] = _next_position(conn, new_status)
    if "condition" in patch and patch["condition"] != t["condition"]:
        if patch["condition"] and not t["condition"] and "wait_since" not in patch:
            patch["wait_since"] = ts
        if not patch["condition"]:
            patch.setdefault("wait_since", None)
            patch["last_follow_up_at"] = None

    changes = {k: v for k, v in patch.items() if t.get(k) != v}
    if not changes and tags is None:
        return t
    if changes:
        changes["updated_at"] = ts
        if any(k in SIGNIFICANT_FIELDS for k in changes):
            changes["last_significant_update"] = ts
        conn.execute(f"UPDATE tasks SET {', '.join(f'{k} = ?' for k in changes)} WHERE id = ?",
                     [*changes.values(), task_id])
    if tags is not None:
        set_tags(conn, "task_tags", "task_id", task_id, tags)

    parts = []
    for k, label in HISTORY_FIELDS.items():
        if k in changes:
            old, new = t.get(k), changes[k]
            if k == "status":
                old, new = STATUS_LABEL.get(old, old), STATUS_LABEL.get(new, new)
            elif k == "condition":
                old, new = CONDITION_LABEL.get(old), CONDITION_LABEL.get(new)
            elif k in ("assignee_id", "reviewer_id"):
                old, new = _name(conn, "people", "name", old), _name(conn, "people", "name", new)
            elif k == "project_id":
                old, new = _name(conn, "projects", "name", old), _name(conn, "projects", "name", new)
            elif k == "parent_id":
                old, new = _name(conn, "tasks", "title", old), _name(conn, "tasks", "title", new)
            elif k == "archived":
                old, new = ("sí" if old else "no"), ("sí" if new else "no")
            parts.append(f"{label}: {_fmt(old)} → {_fmt(new)}")
    if "description" in changes:
        parts.append("Descripción actualizada")
    if parts:
        add_history(conn, task_id, "cambio", "; ".join(parts), ts)
    if "condition" in changes and changes["condition"] is None:
        add_history(conn, task_id, "cambio", "Espera/bloqueo resuelto", ts)
    return get_task_row(conn, task_id)


def record_update(conn, task_id: int, text: str) -> None:
    """Manual update: counts as significant."""
    get_task_row(conn, task_id)
    ts = now_utc()
    conn.execute("UPDATE tasks SET last_significant_update = ?, updated_at = ? WHERE id = ?", (ts, ts, task_id))
    add_history(conn, task_id, "actualizacion", text, ts)


def edit_update(conn, task_id: int, history_id: int, text: str) -> None:
    """Correct the text of a manual update. Automatic entries are not editable.
    Correcting does not count as a new significant update."""
    h = conn.execute("SELECT kind FROM task_history WHERE id = ? AND task_id = ?", (history_id, task_id)).fetchone()
    if not h:
        raise not_found("Entrada del historial")
    if h["kind"] not in EDITABLE_HISTORY:
        raise invalid("Solo se pueden editar las actualizaciones manuales; los cambios automáticos se conservan tal cual",
                      "no_editable")
    conn.execute("UPDATE task_history SET text = ?, edited_at = ? WHERE id = ?", (text[:5000], now_utc(), history_id))


def record_follow_up(conn, task_id: int, text: str) -> None:
    """Follow-up done: does not resolve the wait/block, restarts the follow-up cycle."""
    get_task_row(conn, task_id)
    ts = now_utc()
    conn.execute("UPDATE tasks SET last_follow_up_at = ?, last_significant_update = ?, updated_at = ? WHERE id = ?",
                 (ts, ts, ts, task_id))
    add_history(conn, task_id, "seguimiento", "Seguimiento realizado" + (f": {text}" if text else ""), ts)


# ---------- Steps (lightweight checklist) ----------
def add_step(conn, task_id: int, text: str) -> int:
    get_task_row(conn, task_id)
    r = conn.execute("SELECT MAX(position) FROM task_steps WHERE task_id = ?", (task_id,)).fetchone()
    return conn.execute("INSERT INTO task_steps(task_id, text, position, created_at) VALUES (?,?,?,?)",
                        (task_id, text.strip(), (r[0] or 0) + 1, now_utc())).lastrowid


def _step(conn, step_id: int) -> dict[str, Any]:
    s = row(conn.execute("SELECT * FROM task_steps WHERE id = ?", (step_id,)).fetchone())
    if not s:
        raise not_found("Paso")
    return s


def update_step(conn, step_id: int, patch: dict[str, Any]) -> int:
    s = _step(conn, step_id)
    ts = now_utc()
    if "text" in patch and patch["text"] is not None:
        conn.execute("UPDATE task_steps SET text = ? WHERE id = ?", (patch["text"].strip(), step_id))
    if "position" in patch and patch["position"] is not None:
        conn.execute("UPDATE task_steps SET position = ? WHERE id = ?", (patch["position"], step_id))
    if "done" in patch and patch["done"] is not None and bool(patch["done"]) != bool(s["done"]):
        conn.execute("UPDATE task_steps SET done = ?, done_at = ? WHERE id = ?",
                     (1 if patch["done"] else 0, ts if patch["done"] else None, step_id))
        # completing a step is real progress: it counts as a significant update
        conn.execute("UPDATE tasks SET last_significant_update = ?, updated_at = ? WHERE id = ?", (ts, ts, s["task_id"]))
        add_history(conn, s["task_id"], "cambio", ("Paso completado: " if patch["done"] else "Paso reabierto: ") + s["text"], ts)
    return s["task_id"]


def delete_step(conn, step_id: int) -> int:
    s = _step(conn, step_id)
    conn.execute("DELETE FROM task_steps WHERE id = ?", (step_id,))
    return s["task_id"]


def promote_step(conn, step_id: int) -> int:
    """Turn a step into a full subtask (visible on the board, list and calendar)."""
    s = _step(conn, step_id)
    parent = get_task_row(conn, s["task_id"])
    tid = create_task(conn, {"title": s["text"], "parent_id": parent["id"], "project_id": parent["project_id"],
                             "assignee_id": parent["assignee_id"],
                             "status": "hecha" if s["done"] else "pendiente"},
                      history_note=f"Creada a partir de un paso de «{parent['title']}»")
    conn.execute("DELETE FROM task_steps WHERE id = ?", (step_id,))
    add_history(conn, parent["id"], "cambio", f"Paso convertido en subtarea: {s['text']}")
    return tid


# ---------- Dependencias ----------
def _depends_transitively(conn, start: int, target: int) -> bool:
    stack, seen = [start], set()
    while stack:
        cur = stack.pop()
        if cur == target:
            return True
        if cur in seen:
            continue
        seen.add(cur)
        stack.extend(r[0] for r in conn.execute("SELECT depends_on_id FROM task_dependencies WHERE task_id = ?", (cur,)))
    return False


def add_dependency(conn, task_id: int, depends_on_id: int) -> None:
    if task_id == depends_on_id:
        raise invalid("Una tarea no puede depender de sí misma", "ciclo")
    get_task_row(conn, task_id)
    other = get_task_row(conn, depends_on_id)
    if _depends_transitively(conn, depends_on_id, task_id):
        raise invalid("La dependencia crearía un ciclo", "ciclo")
    conn.execute("INSERT OR IGNORE INTO task_dependencies(task_id, depends_on_id) VALUES (?, ?)", (task_id, depends_on_id))
    add_history(conn, task_id, "cambio", f"Depende de: «{other['title']}»")


def remove_dependency(conn, task_id: int, depends_on_id: int) -> None:
    conn.execute("DELETE FROM task_dependencies WHERE task_id = ? AND depends_on_id = ?", (task_id, depends_on_id))
    add_history(conn, task_id, "cambio", f"Eliminada dependencia de «{_name(conn, 'tasks', 'title', depends_on_id)}»")


# ---------- Lectura enriquecida ----------
def decorate(conn, items: list[dict[str, Any]]) -> list[dict[str, Any]]:
    if not items:
        return items
    ids = [t["id"] for t in items]
    ph = ",".join("?" for _ in ids)
    tags: dict[int, list[str]] = {}
    for r in conn.execute(f"SELECT tt.task_id, g.name FROM task_tags tt JOIN tags g ON g.id = tt.tag_id WHERE tt.task_id IN ({ph})", ids):
        tags.setdefault(r["task_id"], []).append(r["name"])
    blocked_by = {r[0]: r[1] for r in conn.execute(
        f"""SELECT d.task_id, COUNT(*) FROM task_dependencies d JOIN tasks o ON o.id = d.depends_on_id
            WHERE d.task_id IN ({ph}) AND o.status NOT IN ('hecha','cancelada') GROUP BY d.task_id""", ids)}
    blocks = {r[0]: r[1] for r in conn.execute(
        f"""SELECT d.depends_on_id, COUNT(*) FROM task_dependencies d JOIN tasks o ON o.id = d.task_id
            WHERE d.depends_on_id IN ({ph}) AND o.status NOT IN ('hecha','cancelada') GROUP BY d.depends_on_id""", ids)}
    subs = {r[0]: (r[1], r[2] or 0) for r in conn.execute(
        f"""SELECT parent_id, COUNT(*), SUM(status IN ('hecha','cancelada')) FROM tasks
            WHERE parent_id IN ({ph}) AND archived = 0 GROUP BY parent_id""", ids)}
    steps = {r[0]: (r[1], r[2] or 0) for r in conn.execute(
        f"SELECT task_id, COUNT(*), SUM(done) FROM task_steps WHERE task_id IN ({ph}) GROUP BY task_id", ids)}
    parent_ids = list({t["parent_id"] for t in items if t["parent_id"]})
    parents = {}
    if parent_ids:
        parents = {r[0]: r[1] for r in conn.execute(
            f"SELECT id, title FROM tasks WHERE id IN ({','.join('?' for _ in parent_ids)})", parent_ids)}
    for t in items:
        t["links"] = jload(t.get("links"), [])
        t["archived"] = bool(t["archived"])
        t["tags"] = sorted(tags.get(t["id"], []), key=str.lower)
        t["open_blockers"] = blocked_by.get(t["id"], 0)
        t["open_dependents"] = blocks.get(t["id"], 0)
        t["subtasks_total"], t["subtasks_closed"] = subs.get(t["id"], (0, 0))
        t["steps_total"], t["steps_done"] = steps.get(t["id"], (0, 0))
        t["parent_title"] = parents.get(t["parent_id"]) if t["parent_id"] else None
    return items


def list_tasks(conn, f: dict[str, Any]) -> list[dict[str, Any]]:
    where, params = ["1=1"], []
    archived_only = f.get("archived") == "only"
    if archived_only:
        where.append("t.archived = 1")
    elif not f.get("include_archived"):
        where.append("t.archived = 0")
    statuses = [s for s in (f.get("status") or "").split(",") if s]
    if statuses:
        where.append(f"t.status IN ({','.join('?' for _ in statuses)})")
        params += statuses
    elif not archived_only:
        if not f.get("include_backlog"):
            where.append("t.status <> 'backlog'")
        if not f.get("include_closed"):
            where.append("t.status NOT IN ('hecha','cancelada')")
    for key in ("project_id", "assignee_id", "parent_id", "recurrence_id"):
        if f.get(key) not in (None, ""):
            if f[key] == "none":
                where.append(f"t.{key} IS NULL")
            else:
                where.append(f"t.{key} = ?")
                params.append(int(f[key]))
    if f.get("person_id"):
        where.append("(t.assignee_id = ? OR t.reviewer_id = ?)")
        params += [int(f["person_id"])] * 2
    prios = [p for p in (f.get("priority") or "").split(",") if p]
    if prios:
        where.append(f"t.priority IN ({','.join('?' for _ in prios)})")
        params += prios
    if f.get("condition"):
        if f["condition"] == "cualquiera":
            where.append("t.condition IS NOT NULL")
        else:
            where.append("t.condition = ?")
            params.append(f["condition"])
    if f.get("tag"):
        where.append("EXISTS (SELECT 1 FROM task_tags tt JOIN tags g ON g.id = tt.tag_id "
                     "WHERE tt.task_id = t.id AND g.name = ? COLLATE NOCASE)")
        params.append(f["tag"])
    if f.get("date_from"):
        where.append("(t.due_date >= ? OR t.planned_date >= ? OR substr(t.next_review_at,1,10) >= ?)")
        params += [f["date_from"]] * 3
    if f.get("date_to"):
        where.append("(t.due_date <= ? OR t.planned_date <= ? OR substr(t.next_review_at,1,10) <= ?)")
        params += [f["date_to"]] * 3
    order = {
        "fecha": "CASE WHEN t.due_date IS NULL THEN 1 ELSE 0 END, t.due_date, t.position",
        "prioridad": "CASE t.priority WHEN 'urgente' THEN 0 WHEN 'alta' THEN 1 WHEN 'normal' THEN 2 ELSE 3 END, t.position",
    }.get(f.get("sort") or "", "t.updated_at DESC" if archived_only else "t.position, t.id")
    q = f"SELECT t.* FROM tasks t WHERE {' AND '.join(where)} ORDER BY {order} LIMIT 2000"
    return decorate(conn, rows(conn.execute(q, params)))


def task_detail(conn, task_id: int) -> dict[str, Any]:
    t = decorate(conn, [get_task_row(conn, task_id)])[0]
    ref = "o.id, o.title, o.status, o.assignee_id, o.project_id"
    t["blocked_by"] = rows(conn.execute(
        f"SELECT {ref} FROM task_dependencies d JOIN tasks o ON o.id = d.depends_on_id WHERE d.task_id = ? ORDER BY o.title", (task_id,)))
    t["blocks"] = rows(conn.execute(
        f"SELECT {ref} FROM task_dependencies d JOIN tasks o ON o.id = d.task_id WHERE d.depends_on_id = ? ORDER BY o.title", (task_id,)))
    t["subtasks"] = rows(conn.execute(
        "SELECT id, title, status, assignee_id, project_id, estimate_hours, due_date FROM tasks WHERE parent_id = ? AND archived = 0 ORDER BY position",
        (task_id,)))
    t["steps"] = rows(conn.execute("SELECT id, text, done, done_at FROM task_steps WHERE task_id = ? ORDER BY position, id", (task_id,)))
    for s in t["steps"]:
        s["done"] = bool(s["done"])
    t["notes"] = rows(conn.execute(
        """SELECT n.id, n.title_manual, n.content, n.created_at, n.state, l.excerpt FROM note_task_links l
           JOIN notes n ON n.id = l.note_id WHERE l.task_id = ? ORDER BY l.created_at""", (task_id,)))
    from .notes import display_title
    from .settings import get_all
    st = get_all(conn)
    for n in t["notes"]:
        n["display_title"] = display_title(n, st["timezone"], st["language"])
        n.pop("content", None)
    t["history"] = rows(conn.execute(
        "SELECT id, at, kind, text, edited_at FROM task_history WHERE task_id = ? ORDER BY id DESC LIMIT 100", (task_id,)))
    for h in t["history"]:
        h["editable"] = h["kind"] in EDITABLE_HISTORY
    t["allocations"] = rows(conn.execute(
        "SELECT week_start, hours FROM task_allocations WHERE task_id = ? ORDER BY week_start", (task_id,)))
    t["recurrence"] = None
    if t["recurrence_id"]:
        r = row(conn.execute("SELECT id, rule, interval_days, weekdays, start_date, end_date, non_working, active FROM recurrences WHERE id = ?",
                             (t["recurrence_id"],)).fetchone())
        if r:
            r["weekdays"] = jload(r["weekdays"], [])
            r["active"] = bool(r["active"])
            t["recurrence"] = r
    return t


def reorder(conn, task_id: int, status: str | None, before_id: int | None, after_id: int | None,
            force: bool = False) -> None:
    """Manual order: intermediate position between neighbours. Not a significant change."""
    t = get_task_row(conn, task_id)
    if status and status != t["status"]:
        update_task(conn, task_id, {"status": status, "force": force})
    pb = get_task_row(conn, before_id)["position"] if before_id else None
    pa = get_task_row(conn, after_id)["position"] if after_id else None
    if pb is not None and pa is not None:
        new = (pb + pa) / 2
    elif pb is not None:
        new = pb - 1
    elif pa is not None:
        new = pa + 1
    else:
        return
    conn.execute("UPDATE tasks SET position = ? WHERE id = ?", (new, task_id))


def set_allocation(conn, task_id: int, week_start: str, hours: float) -> None:
    get_task_row(conn, task_id)
    if date.fromisoformat(week_start).isoweekday() != 1:
        raise invalid("La semana debe indicarse por su lunes")
    if hours == 0:
        conn.execute("DELETE FROM task_allocations WHERE task_id = ? AND week_start = ?", (task_id, week_start))
    else:
        conn.execute("INSERT INTO task_allocations(task_id, week_start, hours) VALUES (?, ?, ?) "
                     "ON CONFLICT(task_id, week_start) DO UPDATE SET hours = excluded.hours", (task_id, week_start, hours))
