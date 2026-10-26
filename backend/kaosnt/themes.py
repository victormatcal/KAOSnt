"""Declarative customisation themes (JSON). Only colours (#hex, rgb[a], hsl[a]), a font family
from a closed list and a border radius. No free CSS, URLs or remote fonts.

Format: {"format": "kaosnt-theme", "version": 1, "id", "name", "description", "font", "radius",
          "light": {variable: color}, "dark": {variable: color}}
Missing variables are taken from the base theme. The same validation exists in the client (src/lib/theme.ts).
"""
from __future__ import annotations

import re
from typing import Any

from .errors import invalid

FORMAT = "kaosnt-theme"
VERSION = 1
FONTS = ("sistema", "serif", "mono", "redondeada")
COLOR_VARS = (
    "bg", "surface", "surface-2", "border", "text", "muted", "accent", "accent-text", "accent-soft",
    "danger", "danger-soft", "warn", "warn-soft", "info", "info-soft", "ok", "ok-soft", "subtle", "focus",
    "toast-bg", "toast-text", "code-bg", "shadow",
)
BUILTIN_IDS = ("predeterminado", "minimalista", "cupertino", "retro", "alto-contraste")
ID_RE = re.compile(r"^[a-z0-9][a-z0-9-]{0,39}$")
_NUM = r"\s*-?\d{1,3}(\.\d+)?%?\s*"
_ALPHA = r"\s*(0|1|0?\.\d+|\d{1,3}%)\s*"
COLOR_RE = re.compile(
    r"^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}"
    rf"|rgba?\({_NUM},{_NUM},{_NUM}(,{_ALPHA})?\)"
    rf"|hsla?\({_NUM},{_NUM},{_NUM}(,{_ALPHA})?\))$")
MAX_CUSTOM = 30


def is_color(v: Any) -> bool:
    return isinstance(v, str) and len(v) <= 60 and bool(COLOR_RE.match(v.strip()))


def validate(theme: Any) -> dict[str, Any]:
    """Return the normalised theme or raise 422 with the reason."""
    if not isinstance(theme, dict):
        raise invalid("El tema debe ser un objeto JSON")
    allowed = {"format", "version", "id", "name", "description", "font", "radius", "light", "dark"}
    extra = set(theme) - allowed
    if extra:
        raise invalid("Campos no admitidos en el tema: {campos}", campos=", ".join(sorted(extra)))
    if theme.get("format") != FORMAT:
        raise invalid('El archivo no es un tema de KAOSnt (format debe ser "kaosnt-theme")')
    if theme.get("version") != VERSION:
        raise invalid("Versión de tema no compatible: {v}", v=theme.get("version"))
    tid = theme.get("id")
    if not isinstance(tid, str) or not ID_RE.match(tid):
        raise invalid("Identificador de tema no válido (minúsculas, números y guiones; máx. 40)")
    name = theme.get("name")
    if not isinstance(name, str) or not name.strip() or len(name) > 60:
        raise invalid("El nombre del tema es obligatorio (máx. 60 caracteres)")
    desc = theme.get("description", "")
    if not isinstance(desc, str) or len(desc) > 300:
        raise invalid("Descripción no válida (máx. 300 caracteres)")
    font = theme.get("font", "sistema")
    if font not in FONTS:
        raise invalid("Fuente no admitida: usa {fuentes}", fuentes=", ".join(FONTS))
    radius = theme.get("radius", 6)
    if not isinstance(radius, int) or isinstance(radius, bool) or not 0 <= radius <= 16:
        raise invalid("El radio debe ser un número entero entre 0 y 16")
    out: dict[str, Any] = {"format": FORMAT, "version": VERSION, "id": tid, "name": name.strip(),
                           "description": desc, "font": font, "radius": radius}
    for mode in ("light", "dark"):
        vars_ = theme.get(mode, {})
        if not isinstance(vars_, dict):
            raise invalid("«{modo}» debe ser un objeto de variables", modo=mode)
        bad = [k for k in vars_ if k not in COLOR_VARS]
        if bad:
            raise invalid("Variables desconocidas en «{modo}»: {vars}", modo=mode, vars=", ".join(sorted(bad)))
        for k, v in vars_.items():
            if not is_color(v):
                raise invalid("Color no válido en «{campo}»: solo #hex, rgb(a) o hsl(a)", campo=f"{mode}.{k}")
        out[mode] = {k: v.strip() for k, v in vars_.items()}
    return out


# ---------- WCAG contrast (for tests and to warn when importing) ----------
def _rgb(c: str) -> tuple[float, float, float] | None:
    c = c.strip()
    if c.startswith("#"):
        h = c[1:]
        if len(h) in (3, 4):
            h = "".join(x * 2 for x in h[:3])
        return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))  # type: ignore[return-value]
    m = re.match(r"rgba?\(([^)]*)\)", c)
    if m:
        p = [x.strip() for x in m.group(1).split(",")][:3]
        return tuple((float(x[:-1]) * 2.55 if x.endswith("%") else float(x)) / 255 for x in p)  # type: ignore[return-value]
    m = re.match(r"hsla?\(([^)]*)\)", c)
    if m:
        import colorsys
        p = [x.strip().rstrip("%") for x in m.group(1).split(",")][:3]
        r, g, b = colorsys.hls_to_rgb(float(p[0]) / 360, float(p[2]) / 100, float(p[1]) / 100)
        return r, g, b
    return None


def contrast(a: str, b: str) -> float:
    def lum(c):
        r, g, b_ = (x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c)
        return 0.2126 * r + 0.7152 * g + 0.0722 * b_
    ca, cb = _rgb(a), _rgb(b)
    if ca is None or cb is None:
        return 0.0
    la, lb = lum(ca), lum(cb)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


# Text/background pairs that must reach ≥ 4.5:1
CONTRAST_PAIRS = (
    ("text", "bg"), ("text", "surface"), ("text", "surface-2"), ("muted", "bg"), ("muted", "surface"),
    ("accent", "surface"), ("accent", "accent-soft"), ("accent-text", "accent"), ("danger", "danger-soft"),
    ("danger", "surface"), ("warn", "warn-soft"), ("info", "info-soft"), ("ok", "ok-soft"), ("toast-text", "toast-bg"),
    ("text", "code-bg"),
)


def contrast_report(full_vars: dict[str, str]) -> list[dict[str, Any]]:
    """Pairs below 4.5:1 (empty = compliant)."""
    out = []
    for fg, bg in CONTRAST_PAIRS:
        if fg in full_vars and bg in full_vars:
            r = contrast(full_vars[fg], full_vars[bg])
            if r < 4.5:
                out.append({"fg": fg, "bg": bg, "ratio": round(r, 2)})
    return out
