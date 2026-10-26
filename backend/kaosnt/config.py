"""Path and network configuration. Code, data and backups are kept apart."""
from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
REPO_DIR = APP_DIR.parent.parent
FRONTEND_DIST = REPO_DIR / "frontend" / "dist"


def _base_dir() -> Path:
    if sys.platform.startswith("win"):
        return Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local")
    return Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local" / "share")


def default_data_dir(demo: bool = False) -> Path:
    return _base_dir() / ("KAOSnt-demo" if demo else "KAOSnt")


def legacy_data_dir(demo: bool = False) -> Path:
    """Folder used by version 0.1 («Centro de trabajo»)."""
    return _base_dir() / ("CentroTrabajo-demo" if demo else "CentroTrabajo")


def adopt_legacy_dir(demo: bool = False) -> tuple[Path, str | None]:
    """If the 0.1 folder exists and the new one does not, rename it (same drive, no data copied).
    If that is not possible (e.g. 0.1 is still open), the old folder keeps being used."""
    new, old = default_data_dir(demo), legacy_data_dir(demo)
    if new.exists() or not old.exists():
        return new, None
    try:
        old.rename(new)
        return new, f"Data from the previous version moved from {old} to {new}"
    except OSError:
        return old, f"Could not rename {old} (is the previous version still open?). That folder is used."


@dataclass
class Config:
    data_dir: Path
    host: str = "127.0.0.1"
    port: int = 8765
    demo: bool = False

    @property
    def db_path(self) -> Path:
        return self.data_dir / "kaosnt.db"

    @property
    def backup_dir(self) -> Path:
        return self.data_dir / "copias"

    def ensure_dirs(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)
        legacy_db = self.data_dir / "centro.db"
        if legacy_db.exists() and not self.db_path.exists():
            # 0.1 database: renamed together with its WAL/SHM files
            for suffix in ("", "-wal", "-shm"):
                src = self.data_dir / f"centro.db{suffix}"
                if src.exists():
                    src.rename(self.data_dir / f"kaosnt.db{suffix}")


def load_config(demo: bool = False, data_dir: str | None = None, port: int | None = None) -> tuple[Config, str | None]:
    env_dir = os.environ.get("KAOSNT_DATA_DIR")
    note = None
    if data_dir or env_dir:
        d = Path(data_dir or env_dir)
    else:
        d, note = adopt_legacy_dir(demo)
    p = port or int(os.environ.get("KAOSNT_PORT", "8766" if demo else "8765"))
    return Config(data_dir=d, port=p, demo=demo), note
