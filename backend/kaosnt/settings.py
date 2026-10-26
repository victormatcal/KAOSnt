"""Preferences persisted in SQLite (settings table, JSON values)."""
from __future__ import annotations

import sqlite3
from typing import Any

from .db import jdump, jload

DEFAULTS: dict[str, Any] = {
    "app_name": "KAOSnt",
    "timezone": "Europe/Madrid",
    "start_view": "hoy",            # hoy | proyectos | trabajo | equipo | notas | ultima
    "last_view": "hoy",
    "due_soon_days": 2,
    # Working hours per ISO day (1 = Monday … 7 = Sunday); None = non-working (0.3)
    "work_schedule": {"1": {"start": "09:00", "end": "18:00"}, "2": {"start": "09:00", "end": "18:00"},
                      "3": {"start": "09:00", "end": "18:00"}, "4": {"start": "09:00", "end": "18:00"},
                      "5": {"start": "09:00", "end": "18:00"}, "6": None, "7": None},
    "backup_retention": 14,
    "quiet_start": "20:00",
    "quiet_end": "08:00",
    "notifications_enabled": False,
    "notifications_discreet": True,
    "recurrence_horizon_days": 7,
    "note_tabs": {"open": [], "active": None},
    # Interface (0.3)
    "language": "en",               # en | es (0.4: English by default; databases created before 0.4 keep "es", see migration 004)
    "date_format": "dd/mm/aaaa",    # dd/mm/aaaa | aaaa-mm-dd | mm/dd/aaaa
    "week_start": 1,                # 1 = Monday | 7 = Sunday (display only; planning is always Monday-Sunday)
    "theme_mode": "sistema",        # sistema | claro | oscuro
    "theme_id": "predeterminado",
    "custom_themes": [],            # imported themes (validated in themes.py)
    "undo_seconds": 8,
    "group_recurring": True,
    "task_panel_width": None,
    # 0.5
    "group_subtasks": True,         # Kanban and List: fold subtasks under their parent (same column and group)
    "note_editor_mode": "editar",   # editar | vista_previa (last mode used in the note editor)       # task detail panel width in px (0.4); None = default (42 % of the window)
    "project_types": ["implementacion", "mantenimiento", "id", "consultoria", "benchmark", "propuesta", "otro"],
}
EDITABLE = set(DEFAULTS.keys()) - {"custom_themes"}  # themes are managed through /api/themes
LEGACY_SCHEDULE_KEYS = ("workdays", "work_start", "work_end")


def me_name(language: str | None) -> str:
    """Name given to the "me" person when it is created (it is data: the user can rename it)."""
    return "Yo" if language == "es" else "Me"


def schedule_from_legacy(workdays: list[int] | None, start: str | None, end: str | None) -> dict[str, Any]:
    days = workdays if workdays is not None else [1, 2, 3, 4, 5]
    win = {"start": start or "09:00", "end": end or "18:00"}
    return {str(i): (dict(win) if i in days else None) for i in range(1, 8)}


def get_all(conn: sqlite3.Connection) -> dict[str, Any]:
    out = dict(DEFAULTS)
    legacy: dict[str, Any] = {}
    for r in conn.execute("SELECT key, value FROM settings"):
        if r["key"] in DEFAULTS:
            out[r["key"]] = jload(r["value"], DEFAULTS[r["key"]])
        elif r["key"] in LEGACY_SCHEDULE_KEYS:
            legacy[r["key"]] = jload(r["value"], None)
    stored = {r[0] for r in conn.execute("SELECT key FROM settings")}
    if "work_schedule" not in stored and legacy:  # data restored from 0.2
        out["work_schedule"] = schedule_from_legacy(legacy.get("workdays"), legacy.get("work_start"), legacy.get("work_end"))
    return out


def get(conn: sqlite3.Connection, key: str) -> Any:
    r = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return jload(r["value"], DEFAULTS.get(key)) if r else DEFAULTS.get(key)


def set_value(conn: sqlite3.Connection, key: str, value: Any) -> None:
    conn.execute(
        "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, jdump(value)),
    )


PANEL_MIN, PANEL_MAX = 320, 2000
_HM = __import__("re").compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def validate_patch(body: dict[str, Any], custom_ids: set[str]) -> None:
    """Validate the settings added in 0.3/0.4. Raises a 422 AppError with the reason."""
    from .errors import invalid
    from .themes import BUILTIN_IDS
    if "language" in body and body["language"] not in ("es", "en"):
        raise invalid("Idioma no admitido")
    if "date_format" in body and body["date_format"] not in ("dd/mm/aaaa", "aaaa-mm-dd", "mm/dd/aaaa"):
        raise invalid("Formato de fecha no admitido")
    if "week_start" in body and body["week_start"] not in (1, 7):
        raise invalid("La semana solo puede empezar en lunes (1) o domingo (7)")
    if "theme_mode" in body and body["theme_mode"] not in ("sistema", "claro", "oscuro"):
        raise invalid("Modo de aspecto no admitido")
    if "theme_id" in body and body["theme_id"] not in BUILTIN_IDS and body["theme_id"] not in custom_ids:
        raise invalid("Tema desconocido")
    if "undo_seconds" in body and not (isinstance(body["undo_seconds"], int) and 3 <= body["undo_seconds"] <= 60):
        raise invalid("El tiempo para deshacer debe estar entre 3 y 60 segundos")
    if "group_recurring" in body and not isinstance(body["group_recurring"], bool):
        raise invalid("Valor no válido para agrupar series")
    if "group_subtasks" in body and not isinstance(body["group_subtasks"], bool):
        raise invalid("Valor no válido para agrupar subtareas")
    if "note_editor_mode" in body and body["note_editor_mode"] not in ("editar", "vista_previa"):
        raise invalid("Modo de editor no admitido")
    if "task_panel_width" in body:
        w = body["task_panel_width"]
        if w is not None and not (isinstance(w, int) and not isinstance(w, bool) and PANEL_MIN <= w <= PANEL_MAX):
            raise invalid("El ancho del panel debe estar entre {min} y {max} píxeles", min=PANEL_MIN, max=PANEL_MAX)
    if "work_schedule" in body:
        sch = body["work_schedule"]
        if not isinstance(sch, dict) or set(sch) != {str(i) for i in range(1, 8)}:
            raise invalid("El horario debe indicar los 7 días (1 = lunes … 7 = domingo)")
        for k, w in sch.items():
            if w is None:
                continue
            if not isinstance(w, dict) or set(w) != {"start", "end"} or not all(isinstance(w[x], str) and _HM.match(w[x]) for x in ("start", "end")):
                raise invalid("Horario no válido para el día {dia} (usa HH:MM)", dia=k)
            if w["start"] >= w["end"]:
                raise invalid("En el día {dia} la hora de fin debe ser posterior a la de inicio", dia=k)
