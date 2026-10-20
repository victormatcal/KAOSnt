"""Acceso a SQLite, migraciones versionadas y utilidades comunes."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"


_clock = None  # reloj inyectable para pruebas (callable que devuelve datetime aware)


def set_clock(clock) -> None:
    global _clock
    _clock = clock


def now_utc() -> str:
    dt = _clock() if _clock else datetime.now(timezone.utc)
    return dt.astimezone(timezone.utc).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")


def connect(db_path: Path | str) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path), timeout=10, check_same_thread=False, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 10000")
    return conn


def migration_files() -> list[tuple[int, Path]]:
    out = []
    for f in sorted(MIGRATIONS_DIR.glob("*.sql")):
        out.append((int(f.name.split("_", 1)[0]), f))
    return out


def latest_version() -> int:
    files = migration_files()
    return files[-1][0] if files else 0


def schema_version(conn: sqlite3.Connection) -> int:
    return conn.execute("PRAGMA user_version").fetchone()[0]


def migrate(conn: sqlite3.Connection, before_migrate=None) -> list[int]:
    """Aplica migraciones pendientes. `before_migrate` se llama (p. ej. copia previa)
    solo si la base ya contenía datos y hay migraciones por aplicar."""
    current = schema_version(conn)
    pending = [(v, f) for v, f in migration_files() if v > current]
    if pending and current > 0 and before_migrate:
        before_migrate(current)
    applied = []
    for v, f in pending:
        sql = f.read_text(encoding="utf-8")
        conn.execute("BEGIN")
        try:
            # executescript hace COMMIT implícito; por eso se ejecutan sentencias una a una
            for stmt in split_sql(sql):
                conn.execute(stmt)
            conn.execute(f"PRAGMA user_version = {v}")
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
        applied.append(v)
    return applied


def split_sql(sql: str) -> Iterable[str]:
    buf: list[str] = []
    for line in sql.splitlines():
        s = line.strip()
        if s.startswith("--") or not s:
            continue
        buf.append(line)
        if s.endswith(";"):
            stmt = "\n".join(buf).strip()
            buf = []
            if sqlite3.complete_statement(stmt):
                yield stmt
    if buf:
        yield "\n".join(buf)


def init_db(db_path: Path, before_migrate=None) -> None:
    conn = connect(db_path)
    try:
        conn.execute("PRAGMA journal_mode = WAL")
        migrate(conn, before_migrate)
    finally:
        conn.close()


class Tx:
    """Transacción explícita: with Tx(conn): ..."""

    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def __enter__(self):
        self.conn.execute("BEGIN IMMEDIATE")
        return self.conn

    def __exit__(self, exc_type, exc, tb):
        if exc_type:
            self.conn.execute("ROLLBACK")
        else:
            self.conn.execute("COMMIT")
        return False


def row(r: sqlite3.Row | None) -> dict[str, Any] | None:
    return dict(r) if r is not None else None


def rows(rs: Iterable[sqlite3.Row]) -> list[dict[str, Any]]:
    return [dict(r) for r in rs]


def jload(s: str | None, default: Any) -> Any:
    if s is None:
        return default
    try:
        return json.loads(s)
    except (ValueError, TypeError):
        return default


def jdump(v: Any) -> str:
    return json.dumps(v, ensure_ascii=False)
