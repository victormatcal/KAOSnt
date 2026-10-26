"""Deleting team members (0.4).

Deactivating a person (``active = 0``) hides them and keeps their history; deleting is permanent:
- open tasks and recurring series they were responsible for are left unassigned or, only if the user
  explicitly chooses so, reassigned to another person (nothing is reassigned automatically);
- closed tasks lose their assignee; reviewer / "waiting on" references are cleared;
- their absences and project allocations are deleted (ON DELETE CASCADE);
- the person marked as "me" cannot be deleted.
A verified backup is created before deleting (done by the API layer).
"""
from __future__ import annotations

import sqlite3
from typing import Any

from .db import jdump, jload, now_utc, row, rows
from .errors import invalid, missing_ref, not_found
from .tasks import add_history, update_task

OPEN = "('backlog','pendiente','en_curso','en_revision')"


def _person(conn: sqlite3.Connection, pid: int) -> dict[str, Any]:
    p = row(conn.execute("SELECT * FROM people WHERE id = ?", (pid,)).fetchone())
    if not p:
        raise not_found("Persona")
    return p


def delete_preview(conn: sqlite3.Connection, pid: int) -> dict[str, Any]:
    """What deleting this person would affect."""
    p = _person(conn, pid)
    one = lambda q: conn.execute(q, (pid,)).fetchone()[0]  # noqa: E731
    return {
        "id": pid, "name": p["name"], "is_me": bool(p["is_me"]),
        "open_tasks": one(f"SELECT COUNT(*) FROM tasks WHERE assignee_id = ? AND status IN {OPEN}"),
        "closed_tasks": one(f"SELECT COUNT(*) FROM tasks WHERE assignee_id = ? AND status NOT IN {OPEN}"),
        "review_tasks": one("SELECT COUNT(*) FROM tasks WHERE reviewer_id = ?"),
        "waiting_tasks": one("SELECT COUNT(*) FROM tasks WHERE wait_on_person_id = ?"),
        "recurrences": one("SELECT COUNT(*) FROM recurrences WHERE assignee_id = ?"),
        "absences": one("SELECT COUNT(*) FROM absences WHERE person_id = ?"),
        "projects": one("SELECT COUNT(*) FROM project_people WHERE person_id = ?"),
    }


def check_delete(conn: sqlite3.Connection, pid: int, reassign_to: int | None) -> dict[str, Any]:
    """Validate a deletion request without changing anything (called before creating the backup)."""
    p = _person(conn, pid)
    if p["is_me"]:
        raise invalid("No se puede eliminar a la persona marcada como «yo»", "es_yo")
    if reassign_to is not None:
        if reassign_to == pid:
            raise invalid("Elige otra persona para reasignar")
        if not conn.execute("SELECT 1 FROM people WHERE id = ?", (reassign_to,)).fetchone():
            raise missing_ref("Persona")
    return p


def delete_person(conn: sqlite3.Connection, pid: int, reassign_to: int | None) -> dict[str, Any]:
    """Delete a person (call inside a transaction). Returns the preview counts plus what was reassigned."""
    p = check_delete(conn, pid, reassign_to)
    summary = delete_preview(conn, pid)
    reassigned = 0
    if reassign_to is not None:
        for t in rows(conn.execute(f"SELECT id FROM tasks WHERE assignee_id = ? AND status IN {OPEN}", (pid,))):
            update_task(conn, t["id"], {"assignee_id": reassign_to})  # records the change in the task history
            reassigned += 1
        conn.execute("UPDATE recurrences SET assignee_id = ?, updated_at = ? WHERE assignee_id = ?", (reassign_to, now_utc(), pid))
    # Series templates keep the person id in JSON: point them to the new person or clear it
    for r in rows(conn.execute("SELECT id, template FROM recurrences WHERE template IS NOT NULL")):
        tpl = jload(r["template"], None)
        if not isinstance(tpl, dict):
            continue
        changed = False
        for k in ("assignee_id", "reviewer_id"):
            if tpl.get(k) == pid:
                tpl[k] = reassign_to if (k == "assignee_id" and reassign_to is not None) else None
                changed = True
        if changed:
            conn.execute("UPDATE recurrences SET template = ? WHERE id = ?", (jdump(tpl), r["id"]))
    for t in rows(conn.execute("SELECT id FROM tasks WHERE assignee_id = ? OR reviewer_id = ? OR wait_on_person_id = ?", (pid, pid, pid))):
        add_history(conn, t["id"], "cambio", f"Persona eliminada del equipo: {p['name']}")
    conn.execute("DELETE FROM people WHERE id = ?", (pid,))  # FKs: assignee/reviewer/wait_on → NULL; absences, allocations → deleted
    return {**summary, "reassigned": reassigned, "reassigned_to": reassign_to}
