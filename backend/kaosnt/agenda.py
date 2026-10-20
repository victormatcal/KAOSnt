"""Oficinas, festivos por oficina y contexto de calendario (festivos y ausencias registrados).
Nunca se infieren festivos ni vacaciones: solo se usan los registrados."""
from __future__ import annotations

import sqlite3
from datetime import date, timedelta
from typing import Any

from .db import rows


def holidays_for(conn: sqlite3.Connection, location_id: int | None) -> set[str]:
    """Festivos comunes (todas las oficinas) + los de la oficina indicada."""
    q = "SELECT date FROM holidays WHERE location_id IS NULL"
    params: list[Any] = []
    if location_id is not None:
        q += " OR location_id = ?"
        params.append(location_id)
    return {r[0] for r in conn.execute(q, params)}


def person_location(conn, person_id: int | None) -> int | None:
    if person_id is None:
        return None
    r = conn.execute("SELECT location_id FROM people WHERE id = ?", (person_id,)).fetchone()
    return r[0] if r else None


def settings_for_person(conn, settings: dict[str, Any], person_id: int | None) -> dict[str, Any]:
    return {**settings, "holidays": holidays_for(conn, person_location(conn, person_id))}


def context(conn, start: date, end: date) -> dict[str, Any]:
    """Por día: festivos (con oficina y personas afectadas) y personas ausentes."""
    s, e = start.isoformat(), end.isoformat()
    people = rows(conn.execute("SELECT id, name, location_id FROM people WHERE active = 1 ORDER BY name"))
    days: dict[str, dict[str, list]] = {}

    def day(d: str) -> dict[str, list]:
        return days.setdefault(d, {"holidays": [], "absences": []})

    for h in rows(conn.execute(
        """SELECT h.date, h.name, h.location_id, l.name AS location FROM holidays h
           LEFT JOIN locations l ON l.id = h.location_id WHERE h.date BETWEEN ? AND ? ORDER BY h.date""", (s, e))):
        affected = [p["name"] for p in people if h["location_id"] is None or p["location_id"] == h["location_id"]]
        day(h["date"])["holidays"].append({"name": h["name"], "location": h["location"], "people": affected})
    for a in rows(conn.execute(
        """SELECT a.person_id, a.start_date, a.end_date, p.name FROM absences a JOIN people p ON p.id = a.person_id
           WHERE a.start_date <= ? AND a.end_date >= ?""", (e, s))):
        d = max(date.fromisoformat(a["start_date"]), start)
        last = min(date.fromisoformat(a["end_date"]), end)
        while d <= last:
            day(d.isoformat())["absences"].append({"person_id": a["person_id"], "name": a["name"]})
            d += timedelta(days=1)
    return {"from": s, "to": e, "days": days}


def person_holidays_between(conn, person_id: int, start: date, end: date) -> list[dict[str, Any]]:
    loc = person_location(conn, person_id)
    q = """SELECT h.date, h.name, l.name AS location FROM holidays h LEFT JOIN locations l ON l.id = h.location_id
           WHERE h.date BETWEEN ? AND ? AND (h.location_id IS NULL""" + (" OR h.location_id = ?)" if loc else ")")
    params: list[Any] = [start.isoformat(), end.isoformat()] + ([loc] if loc else [])
    return rows(conn.execute(q + " ORDER BY h.date", params))
