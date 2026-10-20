"""Punto de entrada: python -m centro [--demo] [--port N] [--data-dir RUTA] [--no-browser]"""
from __future__ import annotations

import argparse
import json
import logging
import sys
import threading
import time
import urllib.request
import webbrowser

import uvicorn

from .app import create_app
from .config import load_config


def _running(url: str) -> bool:
    try:
        with urllib.request.urlopen(url + "/api/health", timeout=1.5) as r:
            return json.loads(r.read().decode()).get("app") == "centro-trabajo"
    except Exception:
        return False


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="centro", description="Centro de trabajo (local)")
    ap.add_argument("--demo", action="store_true", help="Usar datos ficticios en una carpeta separada")
    ap.add_argument("--port", type=int)
    ap.add_argument("--data-dir")
    ap.add_argument("--no-browser", action="store_true")
    args = ap.parse_args(argv)

    logging.basicConfig(level=logging.WARNING, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    cfg = load_config(demo=args.demo, data_dir=args.data_dir, port=args.port)
    url = f"http://127.0.0.1:{cfg.port}"
    if _running(url):
        print(f"Centro de trabajo ya está en marcha en {url}")
        if not args.no_browser:
            webbrowser.open(url)
        return 0

    cfg.ensure_dirs()
    if args.demo:
        from .demo import seed_if_empty
        seed_if_empty(cfg)

    app = create_app(cfg)
    server = uvicorn.Server(uvicorn.Config(
        app, host=cfg.host, port=cfg.port, access_log=False, log_level="warning", lifespan="on"))
    app.state.server = server

    def open_browser():
        for _ in range(50):
            if server.started:
                webbrowser.open(url)
                return
            time.sleep(0.2)

    print(f"Centro de trabajo {'(DEMO) ' if args.demo else ''}en {url}")
    print(f"Datos: {cfg.data_dir}")
    print("Para cerrar: botón «Cerrar aplicación» en Configuración, detener.bat o Ctrl+C en esta ventana.")
    if not args.no_browser:
        threading.Thread(target=open_browser, daemon=True).start()
    server.run()
    print("Centro de trabajo cerrado correctamente.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
