"""Búsqueda por contenido en tareas, proyectos y notas.

Insensible a mayúsculas y acentos. Todas las palabras deben aparecer; las frases entre comillas
se buscan literalmente. Diseñada para el volumen de un único usuario (decenas de miles de registros).
"""
from __future__ import annotations

import re
import sqlite3
import unicodedata
from typing import Any

from .notes import display_title
from .settings import get_all


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    return "".join(c for c in s if not unicodedata.combining(c)).lower()


def parse_query(q: str) -> list[str]:
    terms = [m.group(1) or m.group(2) for m in re.finditer(r'"([^"]+)"|(\S+)', q or "")]
    return [norm(t).strip() for t in terms if t and norm(t).strip()]


def snippet(text: str, terms: list[str], width: int = 70) -> str:
    plain = re.sub(r"\s+", " ", text or "")
    n = norm(plain)  # NFKD+eliminación de diacríticos conserva longitudes en textos habituales
    pos = -1
    for t in terms:
        pos = n.find(t)
        if pos >= 0:
            break
    if pos < 0 or len(n) != len(plain):
        return plain[: width * 2] + ("…" if len(plain) > width * 2 else "")
    a, b = max(0, pos - width), min(len(plain), pos + width)
    return ("…" if a > 0 else "") + plain[a:b] + ("…" if b < len(plain) else "")


def search(conn: sqlite3.Connection, q: str, include_archived: bool = False, include_trash: bool = False,
           limit: int = 60) -> dict[str, Any]:
    terms = parse_query(q)
    if not terms:
        return {"query": q, "results": []}
    tz_name = get_all(conn)["timezone"]
    projects = {r["id"]: r["name"] for r in conn.execute("SELECT id, name FROM projects")}
    results: list[dict[str, Any]] = []

    def match(*fields: str) -> bool:
        hay = norm(" \n ".join(f or "" for f in fields))
        return all(t in hay for t in terms)

    note_states = ["'activa'"] + (["'archivada'"] if include_archived else []) + (["'papelera'"] if include_trash else [])
    for n in conn.execute(f"SELECT * FROM notes WHERE state IN ({','.join(note_states)}) ORDER BY updated_at DESC"):
        n = dict(n)
        title = display_title(n, tz_name)
        if match(title, n["content"]):
            results.append({
                "type": "nota", "id": n["id"], "title": title, "state": n["state"],
                "context": " · ".join(x for x in [projects.get(n["project_id"]), n["kind"],
                                                   "archivada" if n["state"] == "archivada" else "",
                                                   "en papelera" if n["state"] == "papelera" else ""] if x) or "Sin clasificar",
                "snippet": snippet(n["content"], terms), "updated_at": n["updated_at"],
            })
    tq = "SELECT * FROM tasks" + ("" if include_archived else " WHERE archived = 0") + " ORDER BY updated_at DESC"
    for t in conn.execute(tq):
        if match(t["title"], t["description"], t["wait_reason"], t["wait_on"], t["wait_next_action"]):
            results.append({
                "type": "tarea", "id": t["id"], "title": t["title"], "state": t["status"],
                "context": " · ".join(x for x in [projects.get(t["project_id"]), t["status"].replace("_", " "),
                                                   "archivada" if t["archived"] else ""] if x),
                "snippet": snippet(t["description"] or t["wait_reason"], terms), "updated_at": t["updated_at"],
            })
    pq = "SELECT * FROM projects" + ("" if include_archived else " WHERE status <> 'archivado'")
    for p in conn.execute(pq):
        if match(p["name"], p["summary"], p["next_action"], p["objective"], p["phase"], p["health_note"]):
            results.append({
                "type": "proyecto", "id": p["id"], "title": p["name"], "state": p["status"],
                "context": f"Proyecto · {p['type']} · {p['status']}",
                "snippet": snippet(p["summary"] or p["next_action"], terms), "updated_at": p["updated_at"],
            })

    def rank(r):  # título primero, luego más reciente
        return (0 if all(t in norm(r["title"]) for t in terms) else 1, r["updated_at"] and -_ts(r["updated_at"]))

    results.sort(key=rank)
    return {"query": q, "results": results[:limit], "total": len(results)}


def _ts(s: str) -> float:
    from .timeutil import parse_dt
    try:
        return parse_dt(s).timestamp()
    except Exception:
        return 0.0
