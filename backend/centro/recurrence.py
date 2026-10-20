"""Tareas recurrentes: plantilla separada de sus ocurrencias.

- Cada ocurrencia es una tarea normal con recurrence_id + occurrence_date (índice único → sin duplicados).
- Se generan ocurrencias hasta hoy + horizonte configurable.
- Si la aplicación estuvo cerrada, de las ocurrencias pasadas no generadas solo se crea la más reciente.
- Días no laborables: regla explícita (saltar, mover al siguiente laborable o mantener).
  Solo se consideran no laborables los días de la semana configurados y los festivos registrados.
"""
from __future__ import annotations

import sqlite3
from datetime import date, timedelta
from typing import Any

from .db import jdump, jload, now_utc, row, rows
from .errors import invalid, not_found
from .tasks import create_task, update_task
from .timeutil import is_working_day, next_working_day


def nominal_dates(rec: dict[str, Any], start: date, end: date, settings: dict[str, Any]) -> list[date]:
    out = []
    rec_start = date.fromisoformat(rec["start_date"])
    weekdays = jload(rec.get("weekdays"), []) if isinstance(rec.get("weekdays"), str) else rec.get("weekdays") or []
    if not weekdays:
        weekdays = [rec_start.isoweekday()]
    d = max(start, rec_start)
    while d <= end:
        rule = rec["rule"]
        if rule == "diaria":
            ok = True
        elif rule == "laborables":
            ok = is_working_day(d, settings)
        elif rule == "semanal":
            ok = d.isoweekday() in weekdays
        else:
            n = rec.get("interval_days") or 1
            ok = (d - rec_start).days % n == 0
        if ok:
            out.append(d)
        d += timedelta(days=1)
    return out


def generate(conn: sqlite3.Connection, settings: dict[str, Any], today: date) -> int:
    horizon = int(settings.get("recurrence_horizon_days") or 7)
    created = 0
    for rec in rows(conn.execute("SELECT * FROM recurrences WHERE active = 1")):
        window_end = today + timedelta(days=horizon)
        if rec["end_date"]:
            window_end = min(window_end, date.fromisoformat(rec["end_date"]))
        start = date.fromisoformat(rec["start_date"])
        if rec["generated_until"]:
            start = max(start, date.fromisoformat(rec["generated_until"]) + timedelta(days=1))
        if start > window_end:
            continue
        dates = nominal_dates(rec, start, window_end, settings)
        past = [d for d in dates if d < today]
        selected = past[-1:] + [d for d in dates if d >= today]
        for d in selected:
            due = d
            if rec["rule"] != "laborables" and not is_working_day(d, settings):
                if rec["non_working"] == "saltar":
                    continue
                if rec["non_working"] == "siguiente_laborable":
                    due = next_working_day(d, settings)
            if conn.execute("SELECT 1 FROM tasks WHERE recurrence_id = ? AND occurrence_date = ?",
                            (rec["id"], d.isoformat())).fetchone():
                continue
            tid = create_task(conn, {
                "title": rec["title"], "description": rec["description"], "project_id": rec["project_id"],
                "assignee_id": rec["assignee_id"], "priority": rec["priority"],
                "estimate_hours": rec["estimate_hours"], "due_date": due.isoformat(),
                "planned_date": due.isoformat(), "status": "pendiente",
            }, history_note=f"Ocurrencia generada ({d.isoformat()})")
            conn.execute("UPDATE tasks SET recurrence_id = ?, occurrence_date = ? WHERE id = ?",
                         (rec["id"], d.isoformat(), tid))
            created += 1
        conn.execute("UPDATE recurrences SET generated_until = ? WHERE id = ?",
                     (window_end.isoformat(), rec["id"]))
    return created


def create(conn, data: dict[str, Any]) -> int:
    if data["rule"] == "cada_n_dias" and not data.get("interval_days"):
        raise invalid("Indica cada cuántos días se repite")
    if data.get("end_date") and data["end_date"] < data["start_date"]:
        raise invalid("La fecha de fin es anterior al inicio")
    for f, t in (("project_id", "projects"), ("assignee_id", "people")):
        if data.get(f) is not None and not conn.execute(f"SELECT 1 FROM {t} WHERE id = ?", (data[f],)).fetchone():
            raise invalid("Referencia no válida")
    ts = now_utc()
    cur = conn.execute(
        """INSERT INTO recurrences(title, description, project_id, assignee_id, priority, estimate_hours, rule,
           interval_days, weekdays, start_date, end_date, non_working, active, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (data["title"], data.get("description", ""), data.get("project_id"), data.get("assignee_id"),
         data.get("priority", "normal"), data.get("estimate_hours"), data["rule"], data.get("interval_days"),
         jdump(data.get("weekdays") or []), data["start_date"], data.get("end_date"),
         data.get("non_working", "saltar"), 1 if data.get("active", True) else 0, ts, ts),
    )
    return cur.lastrowid


def update(conn, rec_id: int, patch: dict[str, Any], today: date) -> dict[str, Any]:
    rec = row(conn.execute("SELECT * FROM recurrences WHERE id = ?", (rec_id,)).fetchone())
    if not rec:
        raise not_found("Recurrencia")
    apply_future = patch.pop("apply_to_future", False)
    if "active" in patch:
        patch["active"] = 1 if patch["active"] else 0
    if patch:
        patch["updated_at"] = now_utc()
        sets = ", ".join(f"{k} = ?" for k in patch)
        conn.execute(f"UPDATE recurrences SET {sets} WHERE id = ?", [*patch.values(), rec_id])
    if apply_future:
        fields = {k: v for k, v in patch.items()
                  if k in ("title", "description", "project_id", "assignee_id", "priority", "estimate_hours")}
        if fields:
            for t in rows(conn.execute(
                """SELECT id FROM tasks WHERE recurrence_id = ? AND occurrence_date >= ?
                   AND status IN ('backlog','pendiente') AND archived = 0""", (rec_id, today.isoformat()))):
                update_task(conn, t["id"], dict(fields))
    return row(conn.execute("SELECT * FROM recurrences WHERE id = ?", (rec_id,)).fetchone())


def skip_occurrence(conn, task_id: int) -> None:
    t = conn.execute("SELECT recurrence_id FROM tasks WHERE id = ?", (task_id,)).fetchone()
    if not t:
        raise not_found("Tarea")
    if t["recurrence_id"] is None:
        raise invalid("Solo se pueden saltar ocurrencias de tareas recurrentes")
    update_task(conn, task_id, {"status": "cancelada"})
    conn.execute("INSERT INTO task_history(task_id, at, kind, text) VALUES (?,?,?,?)",
                 (task_id, now_utc(), "cambio", "Ocurrencia saltada"))


def list_all(conn) -> list[dict[str, Any]]:
    out = rows(conn.execute("SELECT * FROM recurrences ORDER BY active DESC, title"))
    for r in out:
        r["weekdays"] = jload(r["weekdays"], [])
        r["active"] = bool(r["active"])
    return out
