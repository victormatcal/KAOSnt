"""Fechas y zonas horarias. Almacenamiento en UTC; cálculo de «hoy» en la zona configurada.

Tiempo natural: diferencia real entre instantes.
Horas laborables: solo cuenta el tiempo dentro del horario y días laborables configurados
(y festivos registrados manualmente). Nunca se infieren festivos ni vacaciones.
"""
from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo


def tz_of(settings: dict[str, Any]) -> ZoneInfo:
    try:
        return ZoneInfo(settings.get("timezone") or "Europe/Madrid")
    except Exception:
        return ZoneInfo("Europe/Madrid")


def parse_dt(s: str | None) -> datetime | None:
    if not s:
        return None
    s = s.strip()
    if len(s) == 10:  # fecha sin hora: inicio del día UTC (solo para comparaciones defensivas)
        return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def fmt_utc(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")


def now(clock: datetime | None = None) -> datetime:
    return clock or datetime.now(timezone.utc)


def today_local(settings: dict[str, Any], clock: datetime | None = None) -> date:
    return now(clock).astimezone(tz_of(settings)).date()


def local_midnight_utc(d: date, settings: dict[str, Any]) -> datetime:
    return datetime.combine(d, time(0, 0), tz_of(settings)).astimezone(timezone.utc)


def week_start(d: date) -> date:
    return d - timedelta(days=d.isoweekday() - 1)


def is_working_day(d: date, settings: dict[str, Any]) -> bool:
    return d.isoweekday() in (settings.get("workdays") or [1, 2, 3, 4, 5]) and d.isoformat() not in (
        settings.get("holidays") or []
    )


def next_working_day(d: date, settings: dict[str, Any], max_days: int = 60) -> date:
    x = d
    for _ in range(max_days):
        if is_working_day(x, settings):
            return x
        x += timedelta(days=1)
    return d


def _hm(s: str) -> time:
    h, m = s.split(":")
    return time(int(h), int(m))


def add_hours(start: datetime, hours: float, mode: str, settings: dict[str, Any]) -> datetime:
    """Devuelve el instante en que se cumplen `hours` desde `start`.
    mode='natural' → tiempo de reloj; mode='laborable' → solo horario laboral."""
    if mode != "laborable":
        return start + timedelta(hours=hours)
    tz = tz_of(settings)
    ws, we = _hm(settings.get("work_start", "09:00")), _hm(settings.get("work_end", "18:00"))
    remaining = timedelta(hours=hours)
    cur = start.astimezone(tz)
    for _ in range(3660):  # límite de seguridad (~10 años)
        d = cur.date()
        if is_working_day(d, settings):
            win_start = datetime.combine(d, ws, tz)
            win_end = datetime.combine(d, we, tz)
            seg_start = max(cur, win_start)
            if seg_start < win_end:
                avail = win_end - seg_start
                if remaining <= avail:
                    return (seg_start + remaining).astimezone(timezone.utc)
                remaining -= avail
        cur = datetime.combine(d + timedelta(days=1), time(0, 0), tz)
    return (start + timedelta(hours=hours)).astimezone(timezone.utc)


def business_hours_between(a: datetime, b: datetime, settings: dict[str, Any]) -> float:
    """Horas laborables entre dos instantes (para mostrar, distinto del tiempo natural)."""
    if b <= a:
        return 0.0
    tz = tz_of(settings)
    ws, we = _hm(settings.get("work_start", "09:00")), _hm(settings.get("work_end", "18:00"))
    total = timedelta()
    d = a.astimezone(tz).date()
    end_d = b.astimezone(tz).date()
    while d <= end_d:
        if is_working_day(d, settings):
            s = max(a, datetime.combine(d, ws, tz))
            e = min(b, datetime.combine(d, we, tz))
            if e > s:
                total += e - s
        d += timedelta(days=1)
    return total.total_seconds() / 3600
