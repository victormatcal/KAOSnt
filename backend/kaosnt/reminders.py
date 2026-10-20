"""Centro interno de recordatorios.

Se recalculan al abrir la aplicación y periódicamente mientras está en marcha. Cada aviso tiene una clave
de deduplicación persistente: reiniciar no los duplica y un aviso descartado no reaparece en el mismo ciclo.
Para seguimientos recurrentes solo existe el aviso del ciclo actual (sin avalancha tras una ausencia).
"""
from __future__ import annotations

import sqlite3
import uuid
from datetime import date, datetime, timedelta, timezone
from typing import Any

from .agenda import holidays_for
from .db import now_utc, rows
from .errors import invalid, not_found
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
    for t in rows(conn.execute("SELECT * FROM tasks WHERE archived = 0 AND status NOT IN ('hecha','cancelada')")):
        tid = t["id"]
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
                  t.assignee_id AS task_assignee_id, p.name AS project_name
           FROM reminders r LEFT JOIN tasks t ON t.id = r.task_id
           LEFT JOIN projects p ON p.id = COALESCE(r.project_id, t.project_id)
           WHERE r.status IN ('pendiente','pospuesto') AND r.due_at <= ?
             AND (r.snoozed_until IS NULL OR r.snoozed_until <= ?)
             AND (r.task_id IS NULL OR (t.archived = 0 AND t.status NOT IN ('hecha','cancelada')))
           ORDER BY r.due_at""", (now, now)))
    for r in items:
        r["rule_label"] = RULE_LABEL.get(r["rule"], r["rule"])
    return items


def upcoming_manual(conn) -> list[dict[str, Any]]:
    return rows(conn.execute("SELECT * FROM reminders WHERE rule = 'manual' AND status IN ('pendiente','pospuesto') ORDER BY due_at"))


def create_manual(conn, title: str, due_at: str, task_id: int | None, project_id: int | None) -> int:
    if task_id is not None and not conn.execute("SELECT 1 FROM tasks WHERE id = ?", (task_id,)).fetchone():
        raise invalid("Tarea no existe")
    if project_id is not None and not conn.execute("SELECT 1 FROM projects WHERE id = ?", (project_id,)).fetchone():
        raise invalid("Proyecto no existe")
    return conn.execute(
        "INSERT INTO reminders(dedup_key, rule, task_id, project_id, title, due_at, created_at) VALUES (?,?,?,?,?,?,?)",
        (f"manual:{uuid.uuid4().hex}", "manual", task_id, project_id, title, fmt_utc(parse_dt(due_at)), now_utc())).lastrowid


def act(conn, reminder_id: int, action: str, until: str | None) -> None:
    if not conn.execute("SELECT 1 FROM reminders WHERE id = ?", (reminder_id,)).fetchone():
        raise not_found("Recordatorio")
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
