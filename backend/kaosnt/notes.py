"""Notas: captura libre sin título ni ubicación, título sugerido, versión para concurrencia,
archivo/papelera recuperables, vínculos a tareas y conversión de fragmentos en tareas."""
from __future__ import annotations

import re
from typing import Any

from .db import now_utc, row, rows
from .errors import AppError, invalid, not_found
from .settings import get, get_all
from .tasks import create_task, set_tags
from .timeutil import parse_dt

_PREFIX = re.compile(r"^\s*(#{1,6}\s+|[-*+]\s+\[[ xX]\]\s+|[-*+]\s+|>\s*|\d+[.)]\s+)")
_ONLY_SYMBOLS = re.compile(r"^[\s\-=*_#>`|:~]*$")


def suggested_title(content: str) -> str | None:
    """Primera línea significativa del contenido, sin marcas Markdown. None si no hay."""
    in_code = False
    for line in (content or "").splitlines():
        s = line.strip()
        if s.startswith("```"):
            in_code = not in_code
            continue
        if in_code or not s or _ONLY_SYMBOLS.match(s):
            continue
        s = _PREFIX.sub("", s).strip()
        s = re.sub(r"[*_`]+", "", s)
        s = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", s).strip()
        if s:
            return s[:80] + ("…" if len(s) > 80 else "")
    return None


def fallback_title(created_at: str, tz_name: str = "Europe/Madrid") -> str:
    dt = parse_dt(created_at)
    try:
        from zoneinfo import ZoneInfo
        dt = dt.astimezone(ZoneInfo(tz_name))
    except Exception:
        pass
    return "Nota del " + dt.strftime("%d/%m/%Y %H:%M")


def display_title(n: dict[str, Any], tz_name: str = "Europe/Madrid") -> str:
    if n.get("title_manual"):
        return n["title_manual"]
    return suggested_title(n.get("content") or "") or fallback_title(n.get("created_at") or now_utc(), tz_name)


def _decorate(conn, items: list[dict[str, Any]], with_content: bool) -> list[dict[str, Any]]:
    tz_name = get_all(conn)["timezone"]
    ids = [n["id"] for n in items]
    tags: dict[int, list[str]] = {}
    links: dict[int, int] = {}
    if ids:
        ph = ",".join("?" for _ in ids)
        for r in conn.execute(f"SELECT nt.note_id, g.name FROM note_tags nt JOIN tags g ON g.id = nt.tag_id WHERE nt.note_id IN ({ph})", ids):
            tags.setdefault(r["note_id"], []).append(r["name"])
        links = {r[0]: r[1] for r in conn.execute(
            f"SELECT note_id, COUNT(*) FROM note_task_links WHERE note_id IN ({ph}) GROUP BY note_id", ids)}
    for n in items:
        n["display_title"] = display_title(n, tz_name)
        n["title_is_suggested"] = not n.get("title_manual")
        n["pinned"] = bool(n["pinned"])
        n["tags"] = sorted(tags.get(n["id"], []), key=str.lower)
        n["linked_tasks"] = links.get(n["id"], 0)
        n["excerpt"] = re.sub(r"\s+", " ", n.get("content") or "")[:160]
        if not with_content:
            n.pop("content", None)
    return items


def get_note_row(conn, note_id: int) -> dict[str, Any]:
    n = row(conn.execute("SELECT * FROM notes WHERE id = ?", (note_id,)).fetchone())
    if not n:
        raise not_found("Nota")
    return n


def note_detail(conn, note_id: int) -> dict[str, Any]:
    n = _decorate(conn, [get_note_row(conn, note_id)], True)[0]
    n["tasks"] = rows(conn.execute(
        """SELECT t.id, t.title, t.status, t.assignee_id, t.project_id, l.excerpt FROM note_task_links l
           JOIN tasks t ON t.id = l.task_id WHERE l.note_id = ? ORDER BY l.created_at""", (note_id,)))
    return n


def create_note(conn, data: dict[str, Any]) -> int:
    task_id = data.get("task_id")
    project_id = data.get("project_id")
    if task_id is not None:
        t = conn.execute("SELECT project_id FROM tasks WHERE id = ?", (task_id,)).fetchone()
        if not t:
            raise invalid("Tarea no existe")
        if project_id is None:
            project_id = t["project_id"]
    if project_id is not None and not conn.execute("SELECT 1 FROM projects WHERE id = ?", (project_id,)).fetchone():
        raise invalid("Proyecto no existe")
    ts = now_utc()
    title = (data.get("title_manual") or "").strip() or None
    nid = conn.execute(
        "INSERT INTO notes(title_manual, content, kind, project_id, created_at, updated_at) VALUES (?,?,?,?,?,?)",
        (title, data.get("content") or "", data.get("kind"), project_id, ts, ts)).lastrowid
    if task_id is not None:
        link_task(conn, nid, task_id)
    return nid


def update_note(conn, note_id: int, patch: dict[str, Any]) -> dict[str, Any]:
    n = get_note_row(conn, note_id)
    base = patch.pop("base_version", None)
    if base is not None and base != n["version"] and "content" in patch:
        raise AppError(409, "conflicto_version",
                       "La nota se ha modificado en otra ventana. Tu texto se conserva; "
                       "recarga la nota o guarda de nuevo para sobrescribir.", {"server_version": n["version"]})
    tags = patch.pop("tags", None)
    if patch.get("project_id") is not None and not conn.execute(
            "SELECT 1 FROM projects WHERE id = ?", (patch["project_id"],)).fetchone():
        raise invalid("Proyecto no existe")
    if "title_manual" in patch:
        patch["title_manual"] = (patch["title_manual"] or "").strip() or None
    if "pinned" in patch:
        patch["pinned"] = 1 if patch["pinned"] else 0
    if "state" in patch:
        patch["trashed_at"] = now_utc() if patch["state"] == "papelera" else None
    changes = {k: v for k, v in patch.items() if n.get(k) != v}
    if changes:
        changes["updated_at"] = now_utc()
        bump = ", version = version + 1" if "content" in changes else ""  # la versión solo cambia con el contenido
        conn.execute(f"UPDATE notes SET {', '.join(f'{k} = ?' for k in changes)}{bump} WHERE id = ?",
                     [*changes.values(), note_id])
    if tags is not None:
        set_tags(conn, "note_tags", "note_id", note_id, tags)
    return note_detail(conn, note_id)


def list_notes(conn, f: dict[str, Any]) -> list[dict[str, Any]]:
    where, params = [], []
    scope = f.get("scope") or "todas"
    if scope == "papelera":
        where.append("state = 'papelera'")
    elif scope == "archivo":
        where.append("state = 'archivada'")
    else:
        where.append("state = 'activa'")
        if scope == "sin_clasificar":
            where.append("project_id IS NULL")
        elif scope == "fijadas":
            where.append("pinned = 1")
    if f.get("project_id") == "none":
        where.append("project_id IS NULL")
    elif f.get("project_id"):
        where.append("(project_id = ? OR id IN (SELECT l.note_id FROM note_task_links l JOIN tasks t ON t.id = l.task_id WHERE t.project_id = ?))")
        params += [int(f["project_id"])] * 2
    if f.get("kind"):
        where.append("kind = ?")
        params.append(f["kind"])
    if f.get("tag"):
        where.append("EXISTS (SELECT 1 FROM note_tags nt JOIN tags g ON g.id = nt.tag_id WHERE nt.note_id = notes.id AND g.name = ? COLLATE NOCASE)")
        params.append(f["tag"])
    if f.get("linked") == "1":
        where.append("EXISTS (SELECT 1 FROM note_task_links l WHERE l.note_id = notes.id)")
    q = f"SELECT * FROM notes WHERE {' AND '.join(where)} ORDER BY pinned DESC, updated_at DESC LIMIT 1000"
    items = rows(conn.execute(q, params))
    text = (f.get("q") or "").strip()
    if text:  # título y/o contenido, sin distinguir mayúsculas ni acentos; todas las palabras
        from .search import norm, parse_query
        terms = parse_query(text)
        field = f.get("in") or "todo"
        tz_name = get_all(conn)["timezone"]

        def hay(n):
            title = display_title(n, tz_name)
            return norm(title if field == "titulo" else n["content"] if field == "contenido" else title + "\n" + n["content"])
        items = [n for n in items if all(t in hay(n) for t in terms)]
    return _decorate(conn, items, False)


def purge_note(conn, note_id: int) -> None:
    if get_note_row(conn, note_id)["state"] != "papelera":
        raise invalid("Solo se pueden eliminar definitivamente notas que estén en la papelera")
    conn.execute("DELETE FROM notes WHERE id = ?", (note_id,))


def link_task(conn, note_id: int, task_id: int, excerpt: str | None = None) -> None:
    get_note_row(conn, note_id)
    if not conn.execute("SELECT 1 FROM tasks WHERE id = ?", (task_id,)).fetchone():
        raise not_found("Tarea")
    conn.execute("INSERT OR IGNORE INTO note_task_links(note_id, task_id, excerpt, created_at) VALUES (?,?,?,?)",
                 (note_id, task_id, excerpt, now_utc()))


def note_to_task(conn, note_id: int, data: dict[str, Any]) -> int:
    """Crea una tarea a partir de un fragmento. La nota no se modifica ni se duplica."""
    n = get_note_row(conn, note_id)
    project_id = data.get("project_id") if data.get("project_id") is not None else n["project_id"]
    tid = create_task(conn, {"title": data["title"], "project_id": project_id,
                             "assignee_id": data.get("assignee_id"), "due_date": data.get("due_date")},
                      history_note=f"Creada desde la nota «{display_title(n)}»")
    link_task(conn, note_id, tid, (data.get("excerpt") or "").strip()[:5000] or None)
    return tid


def get_tabs(conn) -> dict[str, Any]:
    tabs = get(conn, "note_tabs") or {"open": [], "active": None}
    existing = {r[0] for r in conn.execute("SELECT id FROM notes WHERE state <> 'papelera'")}
    open_ids = [i for i in tabs.get("open", []) if i in existing]
    active = tabs.get("active") if tabs.get("active") in open_ids else (open_ids[0] if open_ids else None)
    split = tabs.get("split")
    split = split if split in open_ids and split != active else None  # pantalla dividida (0.3)
    out = {"open": open_ids, "active": active}
    if split is not None:
        out["split"] = split
    return out
