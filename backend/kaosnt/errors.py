class AppError(Exception):
    """Error de negocio con mensaje para el usuario (en español) y código estable."""

    def __init__(self, status: int, code: str, message: str, extra: dict | None = None):
        super().__init__(message)
        self.status = status
        self.code = code
        self.message = message
        self.extra = extra or {}


def not_found(what: str) -> AppError:
    return AppError(404, "no_encontrado", f"{what} no encontrado")


def invalid(message: str, code: str = "dato_no_valido") -> AppError:
    return AppError(422, code, message)
