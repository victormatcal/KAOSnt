"""Configuración de rutas y red. Código, datos y copias están separados."""
from __future__ import annotations

import os
import sys
from dataclasses import dataclass
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
REPO_DIR = APP_DIR.parent.parent
FRONTEND_DIST = REPO_DIR / "frontend" / "dist"


def default_data_dir(demo: bool = False) -> Path:
    name = "CentroTrabajo-demo" if demo else "CentroTrabajo"
    if sys.platform.startswith("win"):
        base = Path(os.environ.get("LOCALAPPDATA") or Path.home() / "AppData" / "Local")
    else:
        base = Path(os.environ.get("XDG_DATA_HOME") or Path.home() / ".local" / "share")
    return base / name


@dataclass
class Config:
    data_dir: Path
    host: str = "127.0.0.1"
    port: int = 8765
    demo: bool = False

    @property
    def db_path(self) -> Path:
        return self.data_dir / "centro.db"

    @property
    def backup_dir(self) -> Path:
        return self.data_dir / "copias"

    def ensure_dirs(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.backup_dir.mkdir(parents=True, exist_ok=True)


def load_config(demo: bool = False, data_dir: str | None = None, port: int | None = None) -> Config:
    env_dir = os.environ.get("CENTRO_DATA_DIR")
    d = Path(data_dir or env_dir) if (data_dir or env_dir) else default_data_dir(demo)
    p = port or int(os.environ.get("CENTRO_PORT", "8765"))
    return Config(data_dir=d, port=p, demo=demo)
