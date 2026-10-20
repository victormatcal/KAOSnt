import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from centro.app import create_app  # noqa: E402
from centro.config import Config  # noqa: E402


class Clock:
    def __init__(self, dt):
        self.dt = dt

    def __call__(self):
        return self.dt


@pytest.fixture
def clock():
    return Clock(datetime(2026, 10, 13, 10, 0, tzinfo=timezone.utc))  # martes


@pytest.fixture
def cfg(tmp_path):
    return Config(data_dir=tmp_path / "datos", port=8765)


def make_client(cfg, clock):
    app = create_app(cfg, clock=clock, background=False, extra_hosts=("testserver",))
    c = TestClient(app)
    c.headers.update({"X-Centro": "1"})
    return c


@pytest.fixture
def client(cfg, clock):
    with make_client(cfg, clock) as c:
        yield c
