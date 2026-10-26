"""«Undo» after direct actions. Before the action a snapshot of the affected rows is stored
(all their columns) and undo restores them exactly (status, completed_at, started_at, position…).
The log is ephemeral (not exported) and expires after 15 minutes. Permanent deletion has no undo."""
from __future__ import annotations

import sqlite3
from datetime import timedelta
from typing import Any

from .db import jdump, jload, now_dt, now_utc, rows
from .errors import AppError, invalid
from .timeutil import fmt_utc, parse_dt

TABLES = {"tasks", "notes", "reminders", "milestones"}
MAX_AGE = timedelta(minutes=15)


def snapshot(conn: sqlite3.Connection, table: str, ids: list[int]) -> list[dict[str, Any]]:
    if table not in TABLES:
        raise ValueError(table)
    ids = [int(i) for i in ids]
    if not ids:
        return []
    out = []
    for i in range(0, len(ids), 500):
        part = ids[i:i + 500]
        out += [{"table": table, "row": r} for r in rows(conn.execute(
            f"SELECT * FROM {table} WHERE id IN ({','.join('?' for _ in part)})", part))]
    return out


def record(conn: sqlite3.Connection, label: str, snaps: list[dict[str, Any]]) -> int | None:
    if not snaps:
        return None
    conn.execute("DELETE FROM undo_log WHERE used = 1 OR created_at < ?", (fmt_utc(now_dt() - timedelta(days=1)),))
    return conn.execute("INSERT INTO undo_log(created_at, label, payload) VALUES (?,?,?)",
                        (now_utc(), label[:200], jdump(snaps))).lastrowid


def apply(conn: sqlite3.Connection, undo_id: int) -> dict[str, Any]:
    u = conn.execute("SELECT * FROM undo_log WHERE id = ?", (undo_id,)).fetchone()
    if not u or u["used"]:
        raise invalid("Esta acción ya no se puede deshacer", "sin_deshacer")
    if now_dt() - parse_dt(u["created_at"]) > MAX_AGE:
        raise invalid("Ha pasado demasiado tiempo para deshacer esta acción", "sin_deshacer")
    restored = 0
    tasks_touched = []
    for s in jload(u["payload"], []):
        table, r = s["table"], s["row"]
        if table not in TABLES:
            continue
        cols = [c for c in r if c != "id"]
        try:
            cur = conn.execute(f"UPDATE {table} SET {', '.join(f'{c} = ?' for c in cols)} WHERE id = ?", [*(r[c] for c in cols), r["id"]])
        except sqlite3.IntegrityError:
            raise AppError(409, "sin_deshacer", "No se puede deshacer: algún elemento relacionado ha cambiado o ya no existe")
        if cur.rowcount:
            restored += 1
            if table == "tasks":
                tasks_touched.append(r["id"])
    if not restored:
        raise invalid("Los elementos de esta acción ya no existen", "sin_deshacer")
    for tid in tasks_touched:
        conn.execute("INSERT INTO task_history(task_id, at, kind, text) VALUES (?,?,?,?)",
                     (tid, now_utc(), "cambio", f"Acción deshecha: {u['label']}" if u["label"] else "Acción deshecha"))
    conn.execute("UPDATE undo_log SET used = 1 WHERE id = ?", (undo_id,))
    return {"ok": True, "restored": restored, "label": u["label"]}
