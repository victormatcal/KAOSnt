"""Content search in tasks (including their steps), projects and notes.

Ignores case and accents. Every word must appear; quoted phrases are searched
literally. Sized for a single user's volume.
"""
from __future__ import annotations

import re
import sqlite3
import unicodedata
from typing import Any

from .notes import display_title
from .settings import get_all
from .timeutil import parse_dt


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s or "")
    return "".join(c for c in s if not unicodedata.combining(c)).lower()


def parse_query(q: str) -> list[str]:
    terms = [m.group(1) or m.group(2) for m in re.finditer(r'"([^"]+)"|(\S+)', q or "")]
    return [norm(t).strip() for t in terms if t and norm(t).strip()]


def snippet(text: str, terms: list[str], width: int = 70) -> str:
    plain = re.sub(r"\s+", " ", text or "")
    n = norm(plain)
    pos = next((n.find(t) for t in terms if n.find(t) >= 0), -1)
    if pos < 0 or len(n) != len(plain):
        return plain[: width * 2] + ("…" if len(plain) > width * 2 else "")
    a, b = max(0, pos - width), min(len(plain), pos + width)
    return ("…" if a > 0 else "") + plain[a:b] + ("…" if b < len(plain) else "")


def _ts(s: str) -> float:
    try:
        return parse_dt(s).timestamp()
    except Exception:
        return 0.0


def search(conn: sqlite3.Connection, q: str, include_archived: bool = False, include_trash: bool = False,
           limit: int = 60) -> dict[str, Any]:
    terms = parse_query(q)
    if not terms:
        return {"query": q, "results": [], "total": 0}
    _st = get_all(conn)
    tz_name, lang = _st["timezone"], _st["language"]
    projects = {r["id"]: r["name"] for r in conn.execute("SELECT id, name FROM projects")}
    steps: dict[int, str] = {}
    for r in conn.execute("SELECT task_id, text FROM task_steps"):
        steps[r[0]] = steps.get(r[0], "") + "\n" + r[1]
    results: list[dict[str, Any]] = []

    def match(*fields: str) -> bool:
        hay = norm(" \n ".join(f or "" for f in fields))
        return all(t in hay for t in terms)

    states = ["'activa'"] + (["'archivada'"] if include_archived else []) + (["'papelera'"] if include_trash else [])
    for n in conn.execute(f"SELECT * FROM notes WHERE state IN ({','.join(states)}) ORDER BY updated_at DESC"):
        n = dict(n)
        title = display_title(n, tz_name, lang)
        if match(title, n["content"]):
            results.append({
                "type": "nota", "id": n["id"], "title": title, "state": n["state"],
                "context": " · ".join(x for x in [projects.get(n["project_id"]), n["kind"],
                                                   "archivada" if n["state"] == "archivada" else "",
                                                   "en papelera" if n["state"] == "papelera" else ""] if x) or "Sin clasificar",
                "project": projects.get(n["project_id"]), "kind": n["kind"], "archived": n["state"] == "archivada",
                "snippet": snippet(n["content"], terms), "updated_at": n["updated_at"]})
    for t in conn.execute("SELECT * FROM tasks" + ("" if include_archived else " WHERE archived = 0") + " ORDER BY updated_at DESC"):
        st = steps.get(t["id"], "")
        if match(t["title"], t["description"], t["wait_reason"], t["wait_on"], t["wait_next_action"], st):
            results.append({
                "type": "tarea", "id": t["id"], "title": t["title"], "state": t["status"],
                "context": " · ".join(x for x in [projects.get(t["project_id"]), t["status"].replace("_", " "),
                                                   "archivada" if t["archived"] else ""] if x),
                "project": projects.get(t["project_id"]), "archived": bool(t["archived"]),
                "snippet": snippet(t["description"] or t["wait_reason"] or st, terms), "updated_at": t["updated_at"]})
    for p in conn.execute("SELECT * FROM projects" + ("" if include_archived else " WHERE status <> 'archivado'")):
        if match(p["name"], p["summary"], p["next_action"], p["objective"], p["phase"], p["health_note"]):
            results.append({
                "type": "proyecto", "id": p["id"], "title": p["name"], "state": p["status"],
                "context": f"Proyecto · {p['type']} · {p['status']}", "project_type": p["type"],
                "snippet": snippet(p["summary"] or p["next_action"], terms), "updated_at": p["updated_at"]})
    results.sort(key=lambda r: (0 if all(t in norm(r["title"]) for t in terms) else 1, -_ts(r["updated_at"])))
    return {"query": q, "results": results[:limit], "total": len(results)}
