"""Preferencias persistidas en SQLite (tabla settings, valores JSON)."""
from __future__ import annotations

import sqlite3
from typing import Any

from .db import jdump, jload

DEFAULTS: dict[str, Any] = {
    "app_name": "Centro de trabajo",
    "timezone": "Europe/Madrid",
    "start_view": "hoy",            # hoy | proyectos | trabajo | equipo | notas | ultima
    "last_view": "hoy",
    "me_person_id": None,
    "due_soon_days": 2,             # regla «vence dentro de X días»
    "workdays": [1, 2, 3, 4, 5],    # ISO: 1 = lunes
    "work_start": "09:00",
    "work_end": "18:00",
    "holidays": [],                 # festivos registrados manualmente 'YYYY-MM-DD'
    "backup_retention": 14,         # copias automáticas diarias a conservar
    "quiet_start": "20:00",
    "quiet_end": "08:00",
    "notifications_enabled": False,
    "notifications_discreet": True,
    "recurrence_horizon_days": 7,
    "note_tabs": {"open": [], "active": None},
    "project_types": ["implementacion", "mantenimiento", "id", "consultoria", "benchmark", "propuesta", "otro"],
}

# Claves que el usuario puede modificar mediante la API
EDITABLE = set(DEFAULTS.keys())


def get_all(conn: sqlite3.Connection) -> dict[str, Any]:
    out = dict(DEFAULTS)
    for r in conn.execute("SELECT key, value FROM settings"):
        if r["key"] in DEFAULTS:
            out[r["key"]] = jload(r["value"], DEFAULTS[r["key"]])
    return out


def get(conn: sqlite3.Connection, key: str) -> Any:
    r = conn.execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return jload(r["value"], DEFAULTS.get(key)) if r else DEFAULTS.get(key)


def set_value(conn: sqlite3.Connection, key: str, value: Any) -> None:
    conn.execute(
        "INSERT INTO settings(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, jdump(value)),
    )
