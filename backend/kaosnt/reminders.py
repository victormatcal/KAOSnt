"""Internal reminder centre.

Recalculated when the application opens and periodically while it runs. Each notice has a persistent
deduplication key: restarting does not duplicate them and a dismissed notice does not come back in the same cycle.
For recurring follow-ups only the notice of the current cycle exists (no avalanche after an absence).
"""
from __future__ import annotations

import sqlite3
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

from .agenda import holidays_for
from .db import now_utc, rows
from .errors import invalid, missing_ref, not_found
from .timeutil import add_hours, fmt_utc, local_midnight_utc, parse_dt

RULE_LABEL = {
    "vence": "Vencimiento próximo", "revision": "Fecha de revisión alcanzada",
    "inicio": "Duración desde el inicio superada", "inactividad": "Sin actualización significativa",
    "seguimiento": "Seguimiento pendiente", "manual": "Recordatorio",
}


def _insert(conn, key: str, rule: str, task_id: int | None, title: str, due_at: datetime) -> bool:
    cur = conn.execute(
        "INSERT OR IGNORE INTO reminders(dedup_key, rule, task_id, title, due_at, created_at) VALUES (?,?,?,?,?,?)",
        (key, rule, task_id, title, fmt_utc(due_at), now_utc()))
    return cur.rowcount > 0


def refresh(conn: sqlite3.Connection, settings: dict[str, Any], clock: datetime | None = None) -> int:
    now = clock or datetime.now(timezone.utc)
    soon = int(settings.get("due_soon_days") or 0)
    locations = {r[0]: r[1] for r in conn.execute("SELECT id, location_id FROM people")}
    hol_cache: dict[Any, set[str]] = {}
    created = 0
    open_tasks = rows(conn.execute("SELECT * FROM tasks WHERE archived = 0 AND status NOT IN ('hecha','cancelada')"))
    # Recurring series: only the oldest open occurrence of each series gets notices (0.3)
    oldest: dict[int, tuple[str, int]] = {}
    for t in open_tasks:
        if t["recurrence_id"] is not None:
            k = (t["occurrence_date"] or "", t["id"])
            if t["recurrence_id"] not in oldest or k < oldest[t["recurrence_id"]]:
                oldest[t["recurrence_id"]] = k
    for t in open_tasks:
        tid = t["id"]
        if t["recurrence_id"] is not None and oldest[t["recurrence_id"]][1] != tid:
            continue
        mode = t["review_hours_mode"] or "natural"
        loc = locations.get(t["assignee_id"])
        if mode == "laborable" and loc not in hol_cache:
            hol_cache[loc] = holidays_for(conn, loc)
        st = {**settings, "holidays": hol_cache.get(loc, set())}
        unit = "laborables" if mode == "laborable" else "naturales"
        if t["due_date"]:
            trigger = local_midnight_utc(date.fromisoformat(t["due_date"]) - timedelta(days=soon), settings)
            if trigger <= now:
                created += _insert(conn, f"vence:{tid}:{t['due_date']}", "vence", tid, f"Vence el {t['due_date']}", trigger)
        if t["next_review_at"]:
            at = parse_dt(t["next_review_at"])
            if at <= now:
                created += _insert(conn, f"revision:{tid}:{t['next_review_at']}", "revision", tid, "Revisar en la fecha indicada", at)
        if t["review_after_start_hours"] and t["started_at"]:
            h = t["review_after_start_hours"]
            at = add_hours(parse_dt(t["started_at"]), h, mode, st)
            if at <= now:
                created += _insert(conn, f"inicio:{tid}:{t['started_at']}:{h}", "inicio", tid,
                                   f"Han pasado {h:g} h {unit} desde el inicio", at)
        if t["review_after_idle_hours"]:
            h, base = t["review_after_idle_hours"], t["last_significant_update"]
            at = add_hours(parse_dt(base), h, mode, st)
            if at <= now:
                created += _insert(conn, f"inactividad:{tid}:{base}:{h}", "inactividad", tid,
                                   f"{h:g} h {unit} sin actualización significativa", at)
        if t["condition"]:
            if t["follow_up_every_days"]:
                base = t["last_follow_up_at"] or t["wait_since"]
                if base:
                    at = parse_dt(base) + timedelta(days=t["follow_up_every_days"])
                    if at <= now:
                        created += _insert(conn, f"seguimiento:{tid}:{base}:{t['follow_up_every_days']}", "seguimiento",
                                           tid, "Seguimiento periódico pendiente", at)
            if t["follow_up_at"]:
                at = parse_dt(t["follow_up_at"])
                if at <= now:
                    created += _insert(conn, f"seguimiento_fecha:{tid}:{t['follow_up_at']}", "seguimiento", tid,
                                       "Fecha de seguimiento alcanzada", at)
    return created


def list_active(conn: sqlite3.Connection, clock: datetime | None = None) -> list[dict[str, Any]]:
    now = fmt_utc(clock or datetime.now(timezone.utc))
    items = rows(conn.execute(
        """SELECT r.*, t.title AS task_title, t.status AS task_status, t.project_id AS task_project_id,
                  t.assignee_id AS task_assignee_id, t.recurrence_id AS task_recurrence_id, p.name AS project_name
           FROM reminders r LEFT JOIN tasks t ON t.id = r.task_id
           LEFT JOIN projects p ON p.id = COALESCE(r.project_id, t.project_id)
           WHERE r.status IN ('pendiente','pospuesto') AND r.due_at <= ?
             AND (r.snoozed_until IS NULL OR r.snoozed_until <= ?)
             AND (r.task_id IS NULL OR (t.archived = 0 AND t.status NOT IN ('hecha','cancelada')))
           ORDER BY r.due_at""", (now, now)))
    # Repeated automatic notices of the same recurring series are grouped into one (the oldest)
    out: list[dict[str, Any]] = []
    groups: dict[tuple[str, int], dict[str, Any]] = {}
    for r in items:
        r["rule_label"] = RULE_LABEL.get(r["rule"], r["rule"])
        r["grouped"] = 1
        if r["rule"] != "manual" and r["task_recurrence_id"] is not None:
            key = (r["rule"], r["task_recurrence_id"])
            if key in groups:
                groups[key]["grouped"] += 1
                groups[key].setdefault("grouped_ids", []).append(r["id"])
                continue
            groups[key] = r
        out.append(r)
    return out


def _decorated(conn, where: str, params: list[Any], order: str, limit: int = 200) -> list[dict[str, Any]]:
    items = rows(conn.execute(
        f"""SELECT r.*, t.title AS task_title, t.status AS task_status, p.name AS project_name
            FROM reminders r LEFT JOIN tasks t ON t.id = r.task_id
            LEFT JOIN projects p ON p.id = COALESCE(r.project_id, t.project_id)
            WHERE {where} ORDER BY {order} LIMIT {int(limit)}""", params))
    for r in items:
        r["rule_label"] = RULE_LABEL.get(r["rule"], r["rule"])
    return items


def list_scheduled(conn, clock: datetime | None = None, task_id: int | None = None) -> list[dict[str, Any]]:
    """Scheduled: pending with a future date or snoozed until a future date."""
    now = fmt_utc(clock or datetime.now(timezone.utc))
    where = "r.status IN ('pendiente','pospuesto') AND (r.due_at > ? OR (r.snoozed_until IS NOT NULL AND r.snoozed_until > ?))"
    params: list[Any] = [now, now]
    if task_id is not None:
        where += " AND r.task_id = ?"
        params.append(task_id)
    return _decorated(conn, where, params, "COALESCE(r.snoozed_until, r.due_at)")


def list_resolved(conn, task_id: int | None = None, limit: int = 100) -> list[dict[str, Any]]:
    where, params = "r.status IN ('atendido','descartado')", []
    if task_id is not None:
        where += " AND r.task_id = ?"
        params.append(task_id)
    return _decorated(conn, where, params, "r.resolved_at DESC", limit)


def scheduled_between(conn, start: datetime, end: datetime) -> list[dict[str, Any]]:
    """Manual reminders scheduled in a future interval (for «Scheduled this week» in Today)."""
    return _decorated(conn, "r.rule = 'manual' AND r.status IN ('pendiente','pospuesto') AND COALESCE(r.snoozed_until, r.due_at) > ? "
                      "AND COALESCE(r.snoozed_until, r.due_at) <= ?", [fmt_utc(start), fmt_utc(end)], "COALESCE(r.snoozed_until, r.due_at)")


def update_manual(conn, reminder_id: int, title: str | None, due_at: str | None) -> None:
    r = conn.execute("SELECT rule, status FROM reminders WHERE id = ?", (reminder_id,)).fetchone()
    if not r:
        raise not_found("Recordatorio")
    if r["rule"] != "manual":
        raise invalid("Solo se pueden editar los recordatorios manuales", "no_editable")
    if title is not None:
        conn.execute("UPDATE reminders SET title = ? WHERE id = ?", (title.strip(), reminder_id))
    if due_at is not None:
        conn.execute("UPDATE reminders SET due_at = ?, snoozed_until = NULL, notified = 0, status = 'pendiente', resolved_at = NULL WHERE id = ?",
                     (fmt_utc(parse_dt(due_at)), reminder_id))


def cancel_manual(conn, reminder_id: int) -> None:
    r = conn.execute("SELECT rule FROM reminders WHERE id = ?", (reminder_id,)).fetchone()
    if not r:
        raise not_found("Recordatorio")
    if r["rule"] != "manual":
        raise invalid("Solo se pueden cancelar los recordatorios manuales; los automáticos se descartan", "no_editable")
    conn.execute("DELETE FROM reminders WHERE id = ?", (reminder_id,))


def upcoming_manual(conn) -> list[dict[str, Any]]:
    return rows(conn.execute("SELECT * FROM reminders WHERE rule = 'manual' AND status IN ('pendiente','pospuesto') ORDER BY due_at"))


def create_manual(conn, title: str, due_at: str, task_id: int | None, project_id: int | None) -> int:
    if task_id is not None and not conn.execute("SELECT 1 FROM tasks WHERE id = ?", (task_id,)).fetchone():
        raise missing_ref("Tarea")
    if project_id is not None and not conn.execute("SELECT 1 FROM projects WHERE id = ?", (project_id,)).fetchone():
        raise missing_ref("Proyecto")
    return conn.execute(
        "INSERT INTO reminders(dedup_key, rule, task_id, project_id, title, due_at, created_at) VALUES (?,?,?,?,?,?,?)",
        (f"manual:{uuid.uuid4().hex}", "manual", task_id, project_id, title, fmt_utc(parse_dt(due_at)), now_utc())).lastrowid


def act(conn, reminder_id: int, action: str, until: str | None) -> None:
    if not conn.execute("SELECT 1 FROM reminders WHERE id = ?", (reminder_id,)).fetchone():
        raise not_found("Recordatorio")
    if action == "reabrir":
        conn.execute("UPDATE reminders SET status = 'pendiente', resolved_at = NULL, snoozed_until = NULL, notified = 0 WHERE id = ?",
                     (reminder_id,))
        return
    if action == "posponer":
        if not until:
            raise invalid("Indica hasta cuándo posponer")
        conn.execute("UPDATE reminders SET status = 'pospuesto', snoozed_until = ? WHERE id = ?",
                     (fmt_utc(parse_dt(until)), reminder_id))
    else:
        conn.execute("UPDATE reminders SET status = ?, resolved_at = ? WHERE id = ?",
                     ("descartado" if action == "descartar" else "atendido", now_utc(), reminder_id))


def mark_notified(conn, ids: list[int]) -> None:
    for i in ids:
        conn.execute("UPDATE reminders SET notified = 1 WHERE id = ?", (i,))
