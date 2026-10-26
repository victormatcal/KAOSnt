"""Business errors with a user-facing message and a stable code.

User-facing messages are written as **translation keys** (Spanish text, the same convention as the frontend
`t("…")`), optionally with `{placeholders}`. The JSON response carries the rendered Spanish text (`message`)
plus `message_key`, `params` and `tparams` (names of params that are themselves translation keys, e.g. an
entity name), so the client renders the message in the configured language with `t(message_key, params)`.
`frontend/tools/i18n-keys.mjs` checks that every server key has an English translation.
"""
from __future__ import annotations

from typing import Any

# Entity names used in "not found" / "does not exist" messages (translation keys).
ENTITIES = (
    "Tarea", "Nota", "Proyecto", "Persona", "Cliente", "Oficina", "Hito", "Recordatorio", "Recurrencia", "Copia",
    "Etiqueta", "Paso", "Entrada del historial", "Recurso", "Agrupación", "Responsable", "Revisor",
    "Persona de la que depende", "Tarea principal", "Festivo", "Ausencia", "Vista guardada",
)


def render(template: str, params: dict[str, Any] | None) -> str:
    """Fill `{name}` placeholders (unknown placeholders are left as they are)."""
    if not params:
        return template
    out = template
    for k, v in params.items():
        out = out.replace("{" + k + "}", str(v))
    return out


class AppError(Exception):
    def __init__(self, status: int, code: str, message: str, extra: dict | None = None,
                 params: dict[str, Any] | None = None, tparams: tuple[str, ...] = ()):
        self.status = status
        self.code = code
        self.message_key = message
        self.params = params or {}
        self.tparams = list(tparams)
        self.message = render(message, self.params)
        self.extra = extra or {}
        super().__init__(self.message)

    def body(self) -> dict[str, Any]:
        out = {"code": self.code, "message": self.message, "message_key": self.message_key, **self.extra}
        if self.params:
            out["params"] = self.params
        if self.tparams:
            out["tparams"] = self.tparams
        return out


def not_found(what: str) -> AppError:
    return AppError(404, "no_encontrado", "{entidad} no encontrado", params={"entidad": what}, tparams=("entidad",))


def missing_ref(what: str) -> AppError:
    """A referenced item (by id) does not exist."""
    return AppError(422, "dato_no_valido", "{entidad} no existe", params={"entidad": what}, tparams=("entidad",))


def invalid(message: str, code: str = "dato_no_valido", **params: Any) -> AppError:
    return AppError(422, code, message, params=params)
