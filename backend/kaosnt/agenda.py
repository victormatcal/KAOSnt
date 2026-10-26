"""Offices, holidays per office and calendar context (registered holidays and absences).
Holidays and leave are never inferred: only registered ones are used."""
from __future__ import annotations

import re
import sqlite3
from datetime import date, timedelta
from typing import Any

from .db import rows


def holidays_for(conn: sqlite3.Connection, location_id: int | None) -> set[str]:
    """Common holidays (all offices) + those of the given office."""
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
    """Per day: holidays (with office and affected people) and absent people."""
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


# ---------- Bulk holiday import (0.3) ----------
COMMON_WORDS = {"", "común", "comun", "todas", "todas las oficinas", "common", "all"}
HEADER_WORDS = ("día", "dia", "fecha", "date", "day")
_DMY = re.compile(r"^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$")
_YMD = re.compile(r"^(\d{4})-(\d{2})-(\d{2})$")


def parse_date_text(s: str) -> str | None:
    s = s.strip()
    m = _YMD.match(s)
    try:
        if m:
            return date(int(m[1]), int(m[2]), int(m[3])).isoformat()
        m = _DMY.match(s)
        if m:
            return date(int(m[3]), int(m[2]), int(m[1])).isoformat()
    except ValueError:
        return None
    return None


def _split(line: str) -> list[str]:
    for sep in ("\t", ";", ","):
        if sep in line:
            return [x.strip().strip('"').strip() for x in line.split(sep)]
    return [line.strip()]


def parse_holidays(conn: sqlite3.Connection, text: str, create_locations: bool) -> list[dict[str, Any]]:
    """Parse «day;name;office» per line. Status per line: importar | duplicado | error (with a reason).
    An unknown office never becomes a common holiday: it is an error unless creating it was requested."""
    locs = {r["name"].lower(): (r["id"], r["name"]) for r in conn.execute("SELECT id, name FROM locations")}
    existing = {(r[0], r[1]) for r in conn.execute("SELECT date, IFNULL(location_id, 0) FROM holidays")}
    seen: set[tuple[str, str]] = set()
    out: list[dict[str, Any]] = []
    first = True
    for n, raw in enumerate((text or "").splitlines()[:2000], start=1):
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        f = _split(line)
        if first:
            first = False
            if parse_date_text(f[0]) is None and f[0].lower() in HEADER_WORDS:
                continue  # cabecera
        item: dict[str, Any] = {"line": n, "text": raw[:300], "date": None, "name": f[1][:200] if len(f) > 1 else "",
                                "location": None, "location_id": None, "new_location": False}
        d = parse_date_text(f[0])
        loc_txt = f[2].strip() if len(f) > 2 else ""
        if len(f) > 3 and any(x for x in f[3:]):
            item.update(status="error", reason_code="columnas", reason="Demasiadas columnas: usa día;nombre;oficina")
        elif d is None:
            item.update(status="error", reason_code="fecha", reason=f"Fecha no válida: «{f[0]}» (usa dd/mm/aaaa o AAAA-MM-DD)")
        else:
            item["date"] = d
            key_loc = "0"
            if loc_txt.lower() not in COMMON_WORDS:
                if loc_txt.lower() in locs:
                    item["location_id"], item["location"] = locs[loc_txt.lower()]
                    key_loc = str(item["location_id"])
                elif create_locations:
                    item.update(location=loc_txt[:100], new_location=True)
                    key_loc = "nueva:" + loc_txt.lower()
                else:
                    item.update(status="error", reason_code="oficina", reason=f"Oficina desconocida: «{loc_txt}» (no se importa como común)",
                                location=loc_txt)
            if "status" not in item:
                k = (d, key_loc)
                if (d, item["location_id"] or 0) in existing:
                    item.update(status="duplicado", reason_code="existe", reason="Ya está registrado")
                elif k in seen:
                    item.update(status="duplicado", reason_code="repetido", reason="Repetido en el texto")
                else:
                    seen.add(k)
                    item.update(status="importar", reason_code="nueva_oficina" if item["new_location"] else "", 
                                reason="Se creará la oficina" if item["new_location"] else "")
        out.append(item)
    return out


def import_holidays(conn: sqlite3.Connection, items: list[dict[str, Any]], ts: str) -> int:
    created = 0
    new_locs: dict[str, int] = {}
    for it in items:
        if it["status"] != "importar":
            continue
        lid = it["location_id"]
        if it["new_location"]:
            key = it["location"].lower()
            if key not in new_locs:
                r = conn.execute("SELECT id FROM locations WHERE name = ?", (it["location"],)).fetchone()
                new_locs[key] = r[0] if r else conn.execute("INSERT INTO locations(name, created_at) VALUES (?,?)",
                                                             (it["location"], ts)).lastrowid
            lid = new_locs[key]
        conn.execute("INSERT OR IGNORE INTO holidays(date, name, location_id, created_at) VALUES (?,?,?,?)",
                     (it["date"], it["name"], lid, ts))
        created += 1
    return created
