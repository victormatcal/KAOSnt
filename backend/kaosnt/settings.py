"""Preferencias persistidas en SQLite (tabla settings, valores JSON)."""
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
    # Horario laboral por día ISO (1 = lunes … 7 = domingo); None = no laborable (0.3)
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
    # Interfaz (0.3)
    "language": "es",               # es | en
    "date_format": "dd/mm/aaaa",    # dd/mm/aaaa | aaaa-mm-dd | mm/dd/aaaa
    "week_start": 1,                # 1 = lunes | 7 = domingo (solo presentación; la planificación es lunes-domingo)
    "theme_mode": "sistema",        # sistema | claro | oscuro
    "theme_id": "predeterminado",
    "custom_themes": [],            # temas importados (validados en themes.py)
    "undo_seconds": 8,
    "group_recurring": True,
    "project_types": ["implementacion", "mantenimiento", "id", "consultoria", "benchmark", "propuesta", "otro"],
}
EDITABLE = set(DEFAULTS.keys()) - {"custom_themes"}  # los temas se gestionan con /api/themes
LEGACY_SCHEDULE_KEYS = ("workdays", "work_start", "work_end")


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
    if "work_schedule" not in stored and legacy:  # datos restaurados de la 0.2
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


_HM = __import__("re").compile(r"^([01]\d|2[0-3]):[0-5]\d$")


def validate_patch(body: dict[str, Any], custom_ids: set[str]) -> str | None:
    """Valida los ajustes de la 0.3. Devuelve un mensaje de error o None."""
    from .themes import BUILTIN_IDS
    if "language" in body and body["language"] not in ("es", "en"):
        return "Idioma no admitido"
    if "date_format" in body and body["date_format"] not in ("dd/mm/aaaa", "aaaa-mm-dd", "mm/dd/aaaa"):
        return "Formato de fecha no admitido"
    if "week_start" in body and body["week_start"] not in (1, 7):
        return "La semana solo puede empezar en lunes (1) o domingo (7)"
    if "theme_mode" in body and body["theme_mode"] not in ("sistema", "claro", "oscuro"):
        return "Modo de aspecto no admitido"
    if "theme_id" in body and body["theme_id"] not in BUILTIN_IDS and body["theme_id"] not in custom_ids:
        return "Tema desconocido"
    if "undo_seconds" in body and not (isinstance(body["undo_seconds"], int) and 3 <= body["undo_seconds"] <= 60):
        return "El tiempo para deshacer debe estar entre 3 y 60 segundos"
    if "group_recurring" in body and not isinstance(body["group_recurring"], bool):
        return "Valor no válido para agrupar series"
    if "work_schedule" in body:
        sch = body["work_schedule"]
        if not isinstance(sch, dict) or set(sch) != {str(i) for i in range(1, 8)}:
            return "El horario debe indicar los 7 días (1 = lunes … 7 = domingo)"
        for k, w in sch.items():
            if w is None:
                continue
            if not isinstance(w, dict) or set(w) != {"start", "end"} or not all(isinstance(w[x], str) and _HM.match(w[x]) for x in ("start", "end")):
                return f"Horario no válido para el día {k} (usa HH:MM)"
            if w["start"] >= w["end"]:
                return f"En el día {k} la hora de fin debe ser posterior a la de inicio"
    return None
