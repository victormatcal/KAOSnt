"""Vistas de lectura sobre las mismas entidades: Hoy, proyecto, persona y planificación semanal.
No se calculan puntuaciones, rankings ni porcentajes de avance."""
from __future__ import annotations

import sqlite3
from datetime import date, datetime, timedelta, timezone
from typing import Any

from .db import jload, row, rows
from .errors import not_found
from .reminders import list_active
from .tasks import _decorate
from .timeutil import today_local, week_start

OPEN_SQL = "t.archived = 0 AND t.status NOT IN ('hecha','cancelada')"


def me_id(conn) -> int | None:
    r = conn.execute("SELECT id FROM people WHERE is_me = 1 ORDER BY id LIMIT 1").fetchone()
    return r["id"] if r else None


def _absences_between(conn, start: date, end: date, person_id: int | None = None) -> list[dict[str, Any]]:
    q = """SELECT a.*, p.name AS person_name FROM absences a JOIN people p ON p.id = a.person_id
           WHERE a.start_date <= ? AND a.end_date >= ?"""
    params: list[Any] = [end.isoformat(), start.isoformat()]
    if person_id:
        q += " AND a.person_id = ?"
        params.append(person_id)
    return rows(conn.execute(q + " ORDER BY a.start_date", params))


def today_view(conn: sqlite3.Connection, settings: dict[str, Any], clock: datetime | None = None) -> dict[str, Any]:
    today = today_local(settings, clock)
    end_week = today + timedelta(days=7 - today.isoweekday())
    me = me_id(conn)
    open_tasks = _decorate(conn, rows(conn.execute(f"SELECT t.* FROM tasks t WHERE {OPEN_SQL}")))
    by_id = {t["id"]: t for t in open_tasks}

    def signals(t: dict[str, Any]) -> list[str]:
        s = []
        if t["due_date"]:
            if t["due_date"] < today.isoformat():
                s.append("vencida")
            elif t["due_date"] == today.isoformat():
                s.append("vence_hoy")
            elif t["due_date"] <= end_week.isoformat():
                s.append("vence_semana")
        if t["condition"]:
            s.append(t["condition"])
        if t["open_blockers"]:
            s.append("bloqueada_por_dependencia")
        if t["open_dependents"]:
            s.append("bloquea_otras")
        if t["status"] == "backlog":
            s.append("backlog")
        if t["approval"] in ("pendiente", "rechazada"):
            s.append("aprobacion_" + t["approval"])
        return s

    for t in open_tasks:
        t["signals"] = signals(t)

    due = [t for t in open_tasks if t["due_date"] and t["due_date"] <= end_week.isoformat()]
    due.sort(key=lambda t: (t["due_date"], t["position"]))
    to_review = [t for t in open_tasks if t["status"] == "en_revision" and me and t["reviewer_id"] == me]
    external = [t for t in open_tasks if t["condition"] and (t["wait_on_person_id"] is None or t["wait_on_person_id"] != me)]
    on_me = [t for t in open_tasks if me and (
        (t["assignee_id"] == me and t["open_dependents"]) or (t["condition"] and t["wait_on_person_id"] == me))]

    # Cada tarea aparece una sola vez: en la primera sección que le corresponde.
    # Las demás señales se muestran como etiquetas sobre la misma tarjeta.
    seen: set[int] = set()

    def take(items):
        out = []
        for t in items:
            if t["id"] not in seen:
                seen.add(t["id"])
                out.append(t)
        return out

    # Orden de prioridad = orden de presentación en pantalla
    sec_due = take(due)
    sec_review = take(to_review)
    sec_external = take(external)
    sec_on_me = take(on_me)

    reminders = list_active(conn, clock)
    for r in reminders:
        r["task_shown_elsewhere"] = r["task_id"] in seen if r["task_id"] else False

    # Resumen operativo del equipo (solo datos registrados; sin valoraciones)
    team = []
    absences = _absences_between(conn, today, end_week)
    for p in rows(conn.execute("SELECT * FROM people WHERE active = 1 ORDER BY is_me DESC, name")):
        mine = [t for t in open_tasks if t["assignee_id"] == p["id"]]
        team.append({
            "person_id": p["id"], "name": p["name"], "is_me": bool(p["is_me"]),
            "active": sum(1 for t in mine if t["status"] in ("pendiente", "en_curso")),
            "in_review": sum(1 for t in mine if t["status"] == "en_revision"),
            "blocked": sum(1 for t in mine if t["condition"]),
            "due_this_week": sum(1 for t in mine if t["due_date"] and t["due_date"] <= end_week.isoformat()),
            "absences": [a for a in absences if a["person_id"] == p["id"]],
        })
    return {
        "today": today.isoformat(), "week_end": end_week.isoformat(), "me_id": me,
        "sections": {
            "depende_de_mi": sec_on_me, "vence": sec_due, "revisar": sec_review, "bloqueos_externos": sec_external,
        },
        "reminders": reminders, "team": team,
        "milestones": rows(conn.execute(
            """SELECT m.*, p.name AS project_name FROM milestones m JOIN projects p ON p.id = m.project_id
               WHERE m.status = 'pendiente' AND m.date IS NOT NULL AND m.date <= ? AND p.status IN ('activo','pausado')
               ORDER BY m.date""", (end_week.isoformat(),))),
    }


def project_overview(conn, project_id: int, settings: dict[str, Any], clock: datetime | None = None) -> dict[str, Any]:
    p = row(conn.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone())
    if not p:
        raise not_found("Proyecto")
    today = today_local(settings, clock)
    p["links"] = jload(p["links"], [])
    p["client"] = row(conn.execute("SELECT * FROM clients WHERE id = ?", (p["client_id"],)).fetchone()) if p["client_id"] else None
    p["people"] = rows(conn.execute(
        """SELECT pe.id, pe.name, pe.role AS person_role, pp.role FROM project_people pp
           JOIN people pe ON pe.id = pp.person_id WHERE pp.project_id = ? ORDER BY pe.name""", (project_id,)))
    p["groupings"] = rows(conn.execute(
        "SELECT * FROM groupings WHERE project_id = ? ORDER BY kind, position, id", (project_id,)))
    p["milestones"] = rows(conn.execute(
        "SELECT * FROM milestones WHERE project_id = ? ORDER BY status = 'pendiente' DESC, date IS NULL, date", (project_id,)))
    open_t = rows(conn.execute(f"SELECT t.* FROM tasks t WHERE t.project_id = ? AND {OPEN_SQL}", (project_id,)))
    t_iso = today.isoformat()
    in14 = (today + timedelta(days=14)).isoformat()
    # Señales objetivas, separadas del estado manual. Ausencia de señales ≠ proyecto bien.
    p["signals"] = {
        "overdue": sum(1 for t in open_t if t["due_date"] and t["due_date"] < t_iso),
        "due_14d": sum(1 for t in open_t if t["due_date"] and t_iso <= t["due_date"] <= in14),
        "blocked": sum(1 for t in open_t if t["condition"] == "bloqueada"),
        "waiting": sum(1 for t in open_t if t["condition"] == "espera"),
        "milestones_14d": sum(1 for m in p["milestones"] if m["status"] == "pendiente" and m["kind"] != "decision"
                              and m["date"] and m["date"] <= in14),
        "decisions_pending": sum(1 for m in p["milestones"] if m["kind"] == "decision" and m["status"] == "pendiente"),
        "approvals_pending": sum(1 for t in open_t if t["approval"] == "pendiente"),
    }
    p["commitments"] = sorted(
        [{"type": "tarea", "id": t["id"], "title": t["title"], "date": t["due_date"]} for t in open_t
         if t["due_date"] and t["due_date"] <= in14]
        + [{"type": m["kind"], "id": m["id"], "title": m["title"], "date": m["date"]} for m in p["milestones"]
           if m["status"] == "pendiente" and m["date"] and m["date"] <= in14 and m["kind"] != "decision"],
        key=lambda x: x["date"])
    return p


def list_projects(conn, include_archived: bool = False) -> list[dict[str, Any]]:
    q = """SELECT p.*, c.name AS client_name,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.archived = 0 AND t.status NOT IN ('hecha','cancelada','backlog')) AS open_tasks,
             (SELECT COUNT(*) FROM tasks t WHERE t.project_id = p.id AND t.archived = 0 AND t.condition IS NOT NULL AND t.status NOT IN ('hecha','cancelada')) AS conditioned_tasks
           FROM projects p LEFT JOIN clients c ON c.id = p.client_id"""
    if not include_archived:
        q += " WHERE p.status <> 'archivado'"
    q += " ORDER BY CASE p.status WHEN 'activo' THEN 0 WHEN 'pausado' THEN 1 WHEN 'cerrado' THEN 2 ELSE 3 END, p.name"
    out = rows(conn.execute(q))
    for p in out:
        p["links"] = jload(p["links"], [])
    return out


def person_view(conn, person_id: int, settings: dict[str, Any], clock: datetime | None = None) -> dict[str, Any]:
    p = row(conn.execute("SELECT * FROM people WHERE id = ?", (person_id,)).fetchone())
    if not p:
        raise not_found("Persona")
    today = today_local(settings, clock)
    ws = week_start(today)
    we = ws + timedelta(days=6)
    tasks = _decorate(conn, rows(conn.execute(
        f"SELECT t.* FROM tasks t WHERE {OPEN_SQL} AND (t.assignee_id = ? OR t.reviewer_id = ?) ORDER BY t.due_date IS NULL, t.due_date, t.position",
        (person_id, person_id))))
    assigned = [t for t in tasks if t["assignee_id"] == person_id]
    est_known = [t["estimate_hours"] for t in assigned if t["estimate_hours"] is not None and t["status"] != "backlog"]
    p["projects"] = rows(conn.execute(
        """SELECT pr.id, pr.name, pr.status, pp.role FROM project_people pp JOIN projects pr ON pr.id = pp.project_id
           WHERE pp.person_id = ? ORDER BY pr.name""", (person_id,)))
    p["active_tasks"] = [t for t in assigned if t["status"] in ("pendiente", "en_curso")]
    p["in_review"] = [t for t in tasks if t["status"] == "en_revision"]
    p["upcoming_due"] = [t for t in assigned if t["due_date"] and t["due_date"] <= (today + timedelta(days=14)).isoformat()]
    p["blocked"] = [t for t in assigned if t["condition"]]
    p["planned_week"] = [t for t in assigned if t["planned_date"] and ws.isoformat() <= t["planned_date"] <= we.isoformat()]
    p["estimate"] = {
        "known_hours": round(sum(est_known), 2) if est_known else None,
        "tasks_with_estimate": len(est_known),
        "tasks_without_estimate": sum(1 for t in assigned if t["estimate_hours"] is None and t["status"] != "backlog"),
    }
    p["absences"] = rows(conn.execute(
        "SELECT * FROM absences WHERE person_id = ? AND end_date >= ? ORDER BY start_date", (person_id, today.isoformat())))
    p["recent_updates"] = rows(conn.execute(
        """SELECT h.at, h.kind, h.text, t.id AS task_id, t.title FROM task_history h JOIN tasks t ON t.id = h.task_id
           WHERE t.assignee_id = ? ORDER BY h.id DESC LIMIT 10""", (person_id,)))
    return p


def week_plan(conn, settings: dict[str, Any], ws: date) -> dict[str, Any]:
    """Planificación semanal. El esfuerzo solo se suma cuando está registrado:
    - reparto explícito de la semana (task_allocations), o
    - estimación completa de una tarea planificada esa semana sin reparto explícito.
    Nunca se reparte automáticamente una estimación entre semanas. Las tareas sin estimación se listan
    aparte (no cuentan como cero). Si una tarea padre tiene subtareas con estimación, se cuentan las
    subtareas y no el padre, para no contar dos veces."""
    ws = week_start(ws)
    we = ws + timedelta(days=6)
    s, e = ws.isoformat(), we.isoformat()
    alloc = {r["task_id"]: r["hours"] for r in conn.execute(
        "SELECT task_id, hours FROM task_allocations WHERE week_start = ?", (s,))}
    candidates = rows(conn.execute(
        f"""SELECT t.* FROM tasks t WHERE {OPEN_SQL} AND (
              (t.planned_date BETWEEN ? AND ?) OR t.id IN (SELECT task_id FROM task_allocations WHERE week_start = ?))""",
        (s, e, s)))
    children_est = {r["parent_id"] for r in conn.execute(
        "SELECT DISTINCT parent_id FROM tasks WHERE parent_id IS NOT NULL AND estimate_hours IS NOT NULL AND archived = 0 AND status <> 'cancelada'")}
    people = rows(conn.execute("SELECT * FROM people WHERE active = 1 ORDER BY is_me DESC, name"))
    absences = _absences_between(conn, ws, we)
    result = []
    for pid, name, cap in [(p["id"], p["name"], p["weekly_capacity_hours"]) for p in people] + [(None, "Sin responsable", None)]:
        mine = [t for t in candidates if t["assignee_id"] == pid]
        counted, unestimated, split = [], [], []
        total = 0.0
        for t in mine:
            if t["id"] in alloc:
                counted.append({**t, "counted_hours": alloc[t["id"]], "source": "reparto"})
                total += alloc[t["id"]]
            elif t["id"] in children_est:
                split.append(t)
            elif t["estimate_hours"] is None:
                unestimated.append(t)
            else:
                counted.append({**t, "counted_hours": t["estimate_hours"], "source": "estimacion"})
                total += t["estimate_hours"]
        p_abs = [a for a in absences if a["person_id"] == pid]
        conflicts = []
        for a in p_abs:
            for t in mine:
                for field in ("planned_date", "due_date"):
                    if t[field] and a["start_date"] <= t[field] <= a["end_date"]:
                        conflicts.append({"task_id": t["id"], "title": t["title"], "field": field,
                                          "date": t[field], "absence_id": a["id"]})
        if pid is None and not mine:
            continue
        result.append({
            "person_id": pid, "name": name, "capacity_hours": cap,
            "counted_hours": round(total, 2) if counted else None,
            "counted": counted, "unestimated": unestimated, "split_into_subtasks": split,
            "absences": p_abs, "conflicts": conflicts,
        })
    return {"week_start": s, "week_end": e, "people": result}
