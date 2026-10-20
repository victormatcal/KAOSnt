"""Fechas y zonas horarias. Almacenamiento en UTC; «hoy» en la zona configurada.

Tiempo natural: diferencia real entre instantes.
Horas laborables: solo dentro del horario de cada día (settings["work_schedule"], por día ISO; 0.3) y sin los
festivos que se pasen en settings["holidays"] (registrados manualmente; nunca se infieren). Si no hay
work_schedule se usa el formato de la 0.2 (workdays + work_start/work_end).
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
    if len(s) == 10:
        return datetime.fromisoformat(s).replace(tzinfo=timezone.utc)
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    dt = datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def fmt_utc(dt: datetime) -> str:
    return dt.astimezone(timezone.utc).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")


def today_local(settings: dict[str, Any], clock: datetime | None = None) -> date:
    return (clock or datetime.now(timezone.utc)).astimezone(tz_of(settings)).date()


def local_midnight_utc(d: date, settings: dict[str, Any]) -> datetime:
    return datetime.combine(d, time(0, 0), tz_of(settings)).astimezone(timezone.utc)


def week_start(d: date) -> date:
    return d - timedelta(days=d.isoweekday() - 1)


def _hm(s: str) -> time:
    h, m = s.split(":")
    return time(int(h), int(m))


def schedule_of(settings: dict[str, Any]) -> dict[int, tuple[time, time] | None]:
    """Horario por día ISO → (inicio, fin) o None si no es laborable."""
    sch = settings.get("work_schedule")
    out: dict[int, tuple[time, time] | None] = {}
    if isinstance(sch, dict):
        for i in range(1, 8):
            w = sch.get(str(i))
            out[i] = (_hm(w["start"]), _hm(w["end"])) if isinstance(w, dict) and w.get("start") and w.get("end") else None
        return out
    days = settings.get("workdays") or [1, 2, 3, 4, 5]
    win = (_hm(settings.get("work_start", "09:00")), _hm(settings.get("work_end", "18:00")))
    return {i: (win if i in days else None) for i in range(1, 8)}


def day_hours(d: date, settings: dict[str, Any]) -> float:
    """Horas laborables nominales de ese día de la semana (sin tener en cuenta festivos)."""
    w = schedule_of(settings)[d.isoweekday()]
    if not w:
        return 0.0
    return max(0.0, (datetime.combine(d, w[1]) - datetime.combine(d, w[0])).total_seconds() / 3600)


def is_working_day(d: date, settings: dict[str, Any]) -> bool:
    return schedule_of(settings)[d.isoweekday()] is not None and d.isoformat() not in (settings.get("holidays") or ())


def next_working_day(d: date, settings: dict[str, Any], max_days: int = 60) -> date:
    x = d
    for _ in range(max_days):
        if is_working_day(x, settings):
            return x
        x += timedelta(days=1)
    return d


def add_hours(start: datetime, hours: float, mode: str, settings: dict[str, Any]) -> datetime:
    """Instante en que se cumplen `hours` desde `start` (natural o laborable)."""
    if mode != "laborable":
        return start + timedelta(hours=hours)
    tz = tz_of(settings)
    sch = schedule_of(settings)
    remaining = timedelta(hours=hours)
    cur = start.astimezone(tz)
    for _ in range(3660):
        d = cur.date()
        if is_working_day(d, settings):
            ws, we = sch[d.isoweekday()]
            win_start, win_end = datetime.combine(d, ws, tz), datetime.combine(d, we, tz)
            seg_start = max(cur, win_start)
            if seg_start < win_end:
                avail = win_end - seg_start
                if remaining <= avail:
                    return (seg_start + remaining).astimezone(timezone.utc)
                remaining -= avail
        cur = datetime.combine(d + timedelta(days=1), time(0, 0), tz)
    return (start + timedelta(hours=hours)).astimezone(timezone.utc)


def business_hours_between(a: datetime, b: datetime, settings: dict[str, Any]) -> float:
    if b <= a:
        return 0.0
    tz = tz_of(settings)
    sch = schedule_of(settings)
    total = timedelta()
    d, end_d = a.astimezone(tz).date(), b.astimezone(tz).date()
    while d <= end_d:
        if is_working_day(d, settings):
            ws, we = sch[d.isoweekday()]
            s, e = max(a, datetime.combine(d, ws, tz)), min(b, datetime.combine(d, we, tz))
            if e > s:
                total += e - s
        d += timedelta(days=1)
    return total.total_seconds() / 3600
