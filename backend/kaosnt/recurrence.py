"""Tareas recurrentes: plantilla separada de sus ocurrencias.

- Cada ocurrencia es una tarea normal con recurrence_id + occurrence_date (índice único → sin duplicados).
- Se generan ocurrencias hasta hoy + horizonte configurable.
- Si la aplicación estuvo cerrada, de las ocurrencias pasadas no generadas solo se crea la más reciente.
- Días no laborables: regla explícita (saltar, mover al siguiente laborable o mantener). Solo cuentan los
  días de la semana configurados y los festivos registrados (comunes + oficina del responsable).
"""
from __future__ import annotations

import sqlite3
from datetime import date, timedelta
from typing import Any

from .agenda import settings_for_person
from .db import jdump, jload, now_utc, row, rows
from .errors import invalid, not_found
from .tasks import add_history, create_task, get_task_row, update_task
from .timeutil import is_working_day, next_working_day, today_local

DAY = ["L", "M", "X", "J", "V", "S", "D"]


def describe(rec: dict[str, Any]) -> str:
    wd = rec.get("weekdays")
    wd = jload(wd, []) if isinstance(wd, str) else (wd or [])
    if rec["rule"] == "semanal":
        return "Semanal (" + ", ".join(DAY[d - 1] for d in sorted(wd)) + ")" if wd else "Semanal"
    if rec["rule"] == "cada_n_dias":
        return f"Cada {rec.get('interval_days') or 1} días"
    return {"diaria": "Diaria", "laborables": "Días laborables"}[rec["rule"]]


def nominal_dates(rec: dict[str, Any], start: date, end: date, settings: dict[str, Any]) -> list[date]:
    out = []
    rec_start = date.fromisoformat(rec["start_date"])
    wd = rec.get("weekdays")
    weekdays = (jload(wd, []) if isinstance(wd, str) else wd) or [rec_start.isoweekday()]
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
            ok = (d - rec_start).days % (rec.get("interval_days") or 1) == 0
        if ok:
            out.append(d)
        d += timedelta(days=1)
    return out


def generate(conn: sqlite3.Connection, settings: dict[str, Any], today: date) -> int:
    horizon = int(settings.get("recurrence_horizon_days") or 7)
    created = 0
    for rec in rows(conn.execute("SELECT * FROM recurrences WHERE active = 1")):
        st = settings_for_person(conn, settings, rec["assignee_id"])
        window_end = today + timedelta(days=horizon)
        if rec["end_date"]:
            window_end = min(window_end, date.fromisoformat(rec["end_date"]))
        start = date.fromisoformat(rec["start_date"])
        if rec["generated_until"]:
            start = max(start, date.fromisoformat(rec["generated_until"]) + timedelta(days=1))
        if start > window_end:
            continue
        dates = nominal_dates(rec, start, window_end, st)
        past = [d for d in dates if d < today]
        for d in past[-1:] + [d for d in dates if d >= today]:
            due = d
            if rec["rule"] != "laborables" and not is_working_day(d, st):
                if rec["non_working"] == "saltar":
                    continue
                if rec["non_working"] == "siguiente_laborable":
                    due = next_working_day(d, st)
            if conn.execute("SELECT 1 FROM tasks WHERE recurrence_id = ? AND occurrence_date = ?",
                            (rec["id"], d.isoformat())).fetchone():
                continue
            tid = create_task(conn, {
                "title": rec["title"], "description": rec["description"], "project_id": rec["project_id"],
                "assignee_id": rec["assignee_id"], "priority": rec["priority"], "estimate_hours": rec["estimate_hours"],
                "due_date": due.isoformat(), "planned_date": due.isoformat(), "status": "pendiente",
            }, history_note=f"Ocurrencia generada ({d.isoformat()})")
            conn.execute("UPDATE tasks SET recurrence_id = ?, occurrence_date = ? WHERE id = ?", (rec["id"], d.isoformat(), tid))
            created += 1
        conn.execute("UPDATE recurrences SET generated_until = ? WHERE id = ?", (window_end.isoformat(), rec["id"]))
    return created


def _validate_rule(data: dict[str, Any]) -> None:
    if data["rule"] == "cada_n_dias" and not data.get("interval_days"):
        raise invalid("Indica cada cuántos días se repite")
    if data["rule"] == "semanal" and not data.get("weekdays"):
        raise invalid("Elige al menos un día de la semana")
    if data.get("end_date") and data["end_date"] < data["start_date"]:
        raise invalid("La fecha de fin es anterior al inicio")


def create(conn, data: dict[str, Any]) -> int:
    _validate_rule(data)
    for f, t in (("project_id", "projects"), ("assignee_id", "people")):
        if data.get(f) is not None and not conn.execute(f"SELECT 1 FROM {t} WHERE id = ?", (data[f],)).fetchone():
            raise invalid("Referencia no válida")
    ts = now_utc()
    return conn.execute(
        """INSERT INTO recurrences(title, description, project_id, assignee_id, priority, estimate_hours, rule,
           interval_days, weekdays, start_date, end_date, non_working, active, created_at, updated_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (data["title"], data.get("description", ""), data.get("project_id"), data.get("assignee_id"),
         data.get("priority", "normal"), data.get("estimate_hours"), data["rule"], data.get("interval_days"),
         jdump(sorted(set(data.get("weekdays") or []))), data["start_date"], data.get("end_date"),
         data.get("non_working", "saltar"), 1 if data.get("active", True) else 0, ts, ts)).lastrowid


def make_recurring(conn, task_id: int, rule: dict[str, Any], settings: dict[str, Any], today: date) -> int:
    """Convierte una tarea existente en la primera ocurrencia de una serie nueva.
    La fecha de inicio la indica el usuario (por defecto, la fecha límite de la tarea u hoy)."""
    t = get_task_row(conn, task_id)
    if t["recurrence_id"]:
        raise invalid("Esta tarea ya pertenece a una serie recurrente")
    start = rule.get("start_date") or t["due_date"] or today.isoformat()
    data = {**rule, "start_date": start, "title": t["title"], "description": t["description"],
            "project_id": t["project_id"], "assignee_id": t["assignee_id"], "priority": t["priority"],
            "estimate_hours": t["estimate_hours"]}
    rec_id = create(conn, data)
    conn.execute("UPDATE tasks SET recurrence_id = ?, occurrence_date = ? WHERE id = ?", (rec_id, start, task_id))
    if not t["due_date"]:
        update_task(conn, task_id, {"due_date": start})
    rec = row(conn.execute("SELECT * FROM recurrences WHERE id = ?", (rec_id,)).fetchone())
    add_history(conn, task_id, "cambio", f"Se repite: {describe(rec)} desde {start}")
    generate(conn, settings, today)
    return rec_id


def update(conn, rec_id: int, patch: dict[str, Any], today: date) -> dict[str, Any]:
    if not conn.execute("SELECT 1 FROM recurrences WHERE id = ?", (rec_id,)).fetchone():
        raise not_found("Recurrencia")
    apply_future = patch.pop("apply_to_future", False)
    if "active" in patch:
        patch["active"] = 1 if patch["active"] else 0
    if patch:
        patch["updated_at"] = now_utc()
        conn.execute(f"UPDATE recurrences SET {', '.join(f'{k} = ?' for k in patch)} WHERE id = ?", [*patch.values(), rec_id])
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
    t = get_task_row(conn, task_id)
    if t["recurrence_id"] is None:
        raise invalid("Solo se pueden saltar ocurrencias de tareas recurrentes")
    update_task(conn, task_id, {"status": "cancelada"})
    add_history(conn, task_id, "cambio", "Ocurrencia saltada")


def list_all(conn) -> list[dict[str, Any]]:
    out = rows(conn.execute("SELECT * FROM recurrences ORDER BY active DESC, title"))
    for r in out:
        r["weekdays"] = jload(r["weekdays"], [])
        r["active"] = bool(r["active"])
        r["description_rule"] = describe(r)
    return out
