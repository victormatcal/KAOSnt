"""SQLite access, versioned migrations and shared helpers."""
from __future__ import annotations

import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"

_clock = None  # injectable clock for tests (callable returning a timezone-aware datetime)


def set_clock(clock) -> None:
    global _clock
    _clock = clock


def now_dt() -> datetime:
    return _clock() if _clock else datetime.now(timezone.utc)


def now_utc() -> str:
    return now_dt().astimezone(timezone.utc).replace(microsecond=0).strftime("%Y-%m-%dT%H:%M:%SZ")


def connect(db_path: Path | str) -> sqlite3.Connection:
    conn = sqlite3.connect(str(db_path), timeout=10, check_same_thread=False, isolation_level=None)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    conn.execute("PRAGMA busy_timeout = 10000")
    return conn


def migration_files() -> list[tuple[int, Path]]:
    return [(int(f.name.split("_", 1)[0]), f) for f in sorted(MIGRATIONS_DIR.glob("*.sql"))]


def latest_version() -> int:
    files = migration_files()
    return files[-1][0] if files else 0


def schema_version(conn: sqlite3.Connection) -> int:
    return conn.execute("PRAGMA user_version").fetchone()[0]


def split_sql(sql: str) -> Iterable[str]:
    buf: list[str] = []
    for line in sql.splitlines():
        s = line.strip()
        if s.startswith("--") or not s:
            continue
        buf.append(line)
        if s.endswith(";"):
            stmt = "\n".join(buf).strip()
            if sqlite3.complete_statement(stmt):
                buf = []
                yield stmt
    if buf:
        yield "\n".join(buf)


def migrate(conn: sqlite3.Connection, before_migrate=None) -> list[int]:
    """Apply pending migrations, each in its own transaction. `before_migrate` (previous backup)
    is only called if the database already had a schema and there are migrations to apply."""
    current = schema_version(conn)
    pending = [(v, f) for v, f in migration_files() if v > current]
    if pending and current > 0 and before_migrate:
        before_migrate(current)
    applied = []
    for v, f in pending:
        sql = f.read_text(encoding="utf-8")
        conn.execute("BEGIN")
        try:
            for stmt in split_sql(sql):
                conn.execute(stmt)
            conn.execute(f"PRAGMA user_version = {v}")
            conn.execute("COMMIT")
        except Exception:
            conn.execute("ROLLBACK")
            raise
        applied.append(v)
    return applied


def init_db(db_path: Path, before_migrate=None) -> None:
    conn = connect(db_path)
    try:
        conn.execute("PRAGMA journal_mode = WAL")
        migrate(conn, before_migrate)
    finally:
        conn.close()


class Tx:
    """Explicit transaction: with Tx(conn): ..."""

    def __init__(self, conn: sqlite3.Connection):
        self.conn = conn

    def __enter__(self):
        self.conn.execute("BEGIN IMMEDIATE")
        return self.conn

    def __exit__(self, exc_type, exc, tb):
        self.conn.execute("ROLLBACK" if exc_type else "COMMIT")
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


def split_values(raw: Any) -> tuple[list[int], bool]:
    """Multi-value id filter (0.5): "3,7,none" → ([3, 7], True). `none` stands for NULL. Invalid items are ignored."""
    ids, with_none = [], False
    for v in str(raw or "").split(","):
        v = v.strip()
        if v == "none":
            with_none = True
        elif v.isdigit():
            ids.append(int(v))
    return ids, with_none


def multi_clause(col: str, raw: Any, params: list[Any]) -> str | None:
    """SQL condition «col IN (…) OR col IS NULL» for a multi-value filter, or None if the filter is empty."""
    ids, with_none = split_values(raw)
    parts = []
    if ids:
        parts.append(f"{col} IN ({','.join('?' for _ in ids)})")
        params.extend(ids)
    if with_none:
        parts.append(f"{col} IS NULL")
    return "(" + " OR ".join(parts) + ")" if parts else None


def jdump(v: Any) -> str:
    return json.dumps(v, ensure_ascii=False)
