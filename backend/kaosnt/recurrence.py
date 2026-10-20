"""Tareas recurrentes: plantilla separada de sus ocurrencias.

- Cada ocurrencia es una tarea normal con recurrence_id + occurrence_date (índice único → sin duplicados).
- Se generan ocurrencias hasta hoy + horizonte configurable.
- Si la aplicación estuvo cerrada, de las ocurrencias pasadas no generadas solo se crea la más reciente.
- Días no laborables: regla explícita (saltar, mover al siguiente laborable o mantener). Solo cuentan los
  días de la semana configurados y los festivos registrados (comunes + oficina del responsable).
- 0.3: plantilla completa (recurrences.template, JSON). Al hacer recurrente una tarea se hereda todo
  (proyecto, responsable, revisor, tipo, prioridad, estimación, descripción, agrupaciones, tarea principal,
  aprobación, revisiones, enlaces, etiquetas, pasos sin marcar y recordatorios manuales). Las fechas
  (planificada, revisión y recordatorios) se desplazan manteniendo su relación con la fecha límite.
  Las referencias que ya no existan se descartan sin romper la generación.
"""
from __future__ import annotations

import sqlite3
import uuid
from datetime import date, datetime, time, timedelta
from typing import Any

from .agenda import settings_for_person
from .db import jdump, jload, now_utc, row, rows
from .errors import invalid, not_found
from .tasks import add_history, add_step, create_task, get_task_row, set_tags, update_task
from .timeutil import fmt_utc, is_working_day, next_working_day, parse_dt, today_local, tz_of

# Campos de la tarea que hereda cada ocurrencia (además del título)
TEMPLATE_FIELDS = (
    "description", "kind", "project_id", "assignee_id", "reviewer_id", "priority", "estimate_hours",
    "workstream_id", "phase_id", "deliverable_id", "parent_id", "approval", "review_after_start_hours",
    "review_after_idle_hours", "review_hours_mode", "links",
)
REF_TABLES = {"project_id": "projects", "assignee_id": "people", "reviewer_id": "people", "parent_id": "tasks"}
GROUPING_KIND = {"workstream_id": "linea", "phase_id": "fase", "deliverable_id": "entregable"}

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
            tpl = jload(rec.get("template"), None)
            if tpl:
                tid = _create_from_template(conn, rec, tpl, due, settings, f"Ocurrencia generada ({d.isoformat()})")
            else:
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
           interval_days, weekdays, start_date, end_date, non_working, active, created_at, updated_at, template)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)""",
        (data["title"], data.get("description", ""), data.get("project_id"), data.get("assignee_id"),
         data.get("priority", "normal"), data.get("estimate_hours"), data["rule"], data.get("interval_days"),
         jdump(sorted(set(data.get("weekdays") or []))), data["start_date"], data.get("end_date"),
         data.get("non_working", "saltar"), 1 if data.get("active", True) else 0, ts, ts,
         jdump(data["template"]) if data.get("template") else None)).lastrowid


def make_recurring(conn, task_id: int, rule: dict[str, Any], settings: dict[str, Any], today: date) -> int:
    """Convierte una tarea existente en la primera ocurrencia de una serie nueva con plantilla completa.
    La fecha de inicio la indica el usuario (por defecto, la fecha límite de la tarea u hoy)."""
    t = get_task_row(conn, task_id)
    if t["recurrence_id"]:
        raise invalid("Esta tarea ya pertenece a una serie recurrente")
    start = rule.get("start_date") or t["due_date"] or today.isoformat()
    _validate_rule({**rule, "start_date": start})
    anchor = date.fromisoformat(t["due_date"] or start)
    data = {**rule, "start_date": start, "title": t["title"], "description": t["description"],
            "project_id": t["project_id"], "assignee_id": t["assignee_id"], "priority": t["priority"],
            "estimate_hours": t["estimate_hours"], "template": build_template(conn, t, anchor, settings)}
    rec_id = create(conn, data)
    conn.execute("UPDATE tasks SET recurrence_id = ?, occurrence_date = ? WHERE id = ?", (rec_id, start, task_id))
    if not t["due_date"]:
        update_task(conn, task_id, {"due_date": start})
    rec = row(conn.execute("SELECT * FROM recurrences WHERE id = ?", (rec_id,)).fetchone())
    add_history(conn, task_id, "cambio", f"Se repite: {describe(rec)} desde {start}")
    generate(conn, settings, today)
    return rec_id


# ---------- Plantilla ----------
def _local_offset(utc: str | None, anchor: date, settings: dict[str, Any]) -> dict[str, Any] | None:
    dt = parse_dt(utc)
    if not dt:
        return None
    loc = dt.astimezone(tz_of(settings))
    return {"days": (loc.date() - anchor).days, "time": loc.strftime("%H:%M")}


def _from_offset(off: dict[str, Any] | None, due: date, settings: dict[str, Any]) -> str | None:
    if not isinstance(off, dict):
        return None
    try:
        h, m = (int(x) for x in str(off.get("time", "09:00")).split(":"))
        d = due + timedelta(days=int(off.get("days", 0)))
        return fmt_utc(datetime.combine(d, time(h, m), tz_of(settings)))
    except (ValueError, TypeError):
        return None


def build_template(conn, t: dict[str, Any], anchor: date, settings: dict[str, Any]) -> dict[str, Any]:
    """Plantilla a partir de una tarea. Fechas relativas a `anchor` (fecha límite de la tarea)."""
    tpl: dict[str, Any] = {k: t.get(k) for k in TEMPLATE_FIELDS}
    tpl["links"] = jload(t.get("links"), []) if isinstance(t.get("links"), str) else (t.get("links") or [])
    tpl["tags"] = [r[0] for r in conn.execute(
        "SELECT g.name FROM task_tags tt JOIN tags g ON g.id = tt.tag_id WHERE tt.task_id = ? ORDER BY g.name", (t["id"],))]
    tpl["steps"] = [r[0] for r in conn.execute("SELECT text FROM task_steps WHERE task_id = ? ORDER BY position, id", (t["id"],))]
    tpl["planned_offset"] = (date.fromisoformat(t["planned_date"]) - anchor).days if t.get("planned_date") else None
    tpl["review_offset"] = _local_offset(t.get("next_review_at"), anchor, settings)
    tpl["reminders"] = [{"title": r["title"], **(_local_offset(r["due_at"], anchor, settings) or {})} for r in rows(conn.execute(
        "SELECT title, due_at FROM reminders WHERE task_id = ? AND rule = 'manual' AND status IN ('pendiente','pospuesto') ORDER BY due_at",
        (t["id"],)))]
    return tpl


def _clean_refs(conn, tpl: dict[str, Any]) -> dict[str, Any]:
    """Descarta referencias que ya no existen (o agrupaciones de otro proyecto)."""
    out = {k: tpl.get(k) for k in TEMPLATE_FIELDS if k in tpl}
    for k, table in REF_TABLES.items():
        if out.get(k) is not None and not conn.execute(f"SELECT 1 FROM {table} WHERE id = ?", (out[k],)).fetchone():
            out[k] = None
    for k, kind in GROUPING_KIND.items():
        gid = out.get(k)
        if gid is not None:
            g = conn.execute("SELECT project_id, kind FROM groupings WHERE id = ?", (gid,)).fetchone()
            if not g or g["kind"] != kind or g["project_id"] != out.get("project_id"):
                out[k] = None
    return out


def _date_fields(tpl: dict[str, Any], due: date, settings: dict[str, Any]) -> dict[str, Any]:
    po = tpl.get("planned_offset")
    return {"due_date": due.isoformat(),
            "planned_date": (due + timedelta(days=int(po))).isoformat() if isinstance(po, int) else due.isoformat(),
            "next_review_at": _from_offset(tpl.get("review_offset"), due, settings)}


def _create_from_template(conn, rec: dict[str, Any], tpl: dict[str, Any], due: date, settings: dict[str, Any], note: str) -> int:
    data = {"title": rec["title"], **_clean_refs(conn, tpl), **_date_fields(tpl, due, settings), "status": "pendiente",
            "tags": [x for x in tpl.get("tags") or [] if isinstance(x, str)]}
    tid = create_task(conn, data, history_note=note)
    for text in tpl.get("steps") or []:
        if isinstance(text, str) and text.strip():
            add_step(conn, tid, text)
    for r in tpl.get("reminders") or []:
        at = _from_offset(r, due, settings)
        if at and isinstance(r.get("title"), str) and r["title"].strip():
            conn.execute("INSERT INTO reminders(dedup_key, rule, task_id, title, due_at, created_at) VALUES (?,?,?,?,?,?)",
                         (f"manual:{uuid.uuid4().hex}", "manual", tid, r["title"][:300], at, now_utc()))
    return tid


def apply_task_to_series(conn, task_id: int, settings: dict[str, Any], today: date) -> int:
    """«Aplicar estos datos a la serie»: la plantilla pasa a ser esta ocurrencia y se actualizan las
    ocurrencias futuras pendientes (sin tocar las demás ni sus fechas límite)."""
    t = get_task_row(conn, task_id)
    if not t["recurrence_id"]:
        raise invalid("Esta tarea no pertenece a una serie recurrente")
    anchor = date.fromisoformat(t["due_date"] or t["occurrence_date"] or today.isoformat())
    tpl = build_template(conn, t, anchor, settings)
    conn.execute("""UPDATE recurrences SET title = ?, description = ?, project_id = ?, assignee_id = ?, priority = ?,
                    estimate_hours = ?, template = ?, updated_at = ? WHERE id = ?""",
                 (t["title"], t["description"], t["project_id"], t["assignee_id"], t["priority"], t["estimate_hours"],
                  jdump(tpl), now_utc(), t["recurrence_id"]))
    n = 0
    for o in rows(conn.execute(
            """SELECT * FROM tasks WHERE recurrence_id = ? AND id <> ? AND occurrence_date >= ?
               AND status IN ('backlog','pendiente') AND archived = 0""", (t["recurrence_id"], task_id, today.isoformat()))):
        fields = {"title": t["title"], **_clean_refs(conn, tpl), "tags": tpl["tags"]}
        if o["due_date"]:
            df = _date_fields(tpl, date.fromisoformat(o["due_date"]), settings)
            fields.update(planned_date=df["planned_date"], next_review_at=df["next_review_at"])
        update_task(conn, o["id"], fields)
        if not conn.execute("SELECT 1 FROM task_steps WHERE task_id = ? AND done = 1", (o["id"],)).fetchone():
            conn.execute("DELETE FROM task_steps WHERE task_id = ?", (o["id"],))
            for text in tpl["steps"]:
                add_step(conn, o["id"], text)
        n += 1
    add_history(conn, task_id, "cambio", f"Datos aplicados a la serie y a {n} ocurrencia(s) futura(s) pendiente(s)")
    return n


def delete_series(conn, rec_id: int, mode: str) -> dict[str, int]:
    """Elimina una serie. mode='conservar': las ocurrencias pasan a ser tareas normales.
    mode='eliminar_pendientes': se eliminan las no iniciadas (backlog, pendiente) y las saltadas (cancelada);
    las hechas y las que están en curso o en revisión se conservan siempre como tareas normales."""
    if mode not in ("conservar", "eliminar_pendientes"):
        raise invalid("Opción de borrado no válida")
    if not conn.execute("SELECT 1 FROM recurrences WHERE id = ?", (rec_id,)).fetchone():
        raise not_found("Recurrencia")
    deleted = 0
    if mode == "eliminar_pendientes":
        deleted = conn.execute("DELETE FROM tasks WHERE recurrence_id = ? AND status IN ('backlog','pendiente','cancelada')",
                               (rec_id,)).rowcount
    kept = conn.execute("UPDATE tasks SET recurrence_id = NULL, occurrence_date = NULL WHERE recurrence_id = ?", (rec_id,)).rowcount
    conn.execute("DELETE FROM recurrences WHERE id = ?", (rec_id,))
    return {"deleted": deleted, "kept": kept}


def update(conn, rec_id: int, patch: dict[str, Any], today: date) -> dict[str, Any]:
    if not conn.execute("SELECT 1 FROM recurrences WHERE id = ?", (rec_id,)).fetchone():
        raise not_found("Recurrencia")
    apply_future = patch.pop("apply_to_future", False)
    if "active" in patch:
        patch["active"] = 1 if patch["active"] else 0
    if patch:
        patch["updated_at"] = now_utc()
        conn.execute(f"UPDATE recurrences SET {', '.join(f'{k} = ?' for k in patch)} WHERE id = ?", [*patch.values(), rec_id])
    fields = {k: v for k, v in patch.items()
              if k in ("title", "description", "project_id", "assignee_id", "priority", "estimate_hours")}
    rec = row(conn.execute("SELECT template FROM recurrences WHERE id = ?", (rec_id,)).fetchone())
    tpl = jload(rec["template"], None)
    if tpl and fields:
        tpl.update({k: v for k, v in fields.items() if k in TEMPLATE_FIELDS})
        conn.execute("UPDATE recurrences SET template = ? WHERE id = ?", (jdump(tpl), rec_id))
    if apply_future:
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
        r["template"] = jload(r.get("template"), None)
        r["occurrences"] = conn.execute("SELECT COUNT(*) FROM tasks WHERE recurrence_id = ?", (r["id"],)).fetchone()[0]
    return out
