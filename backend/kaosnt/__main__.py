"""Punto de entrada: python -m kaosnt [--demo] [--port N] [--data-dir RUTA] [--no-browser]"""
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

from . import APP_ID
from .app import create_app
from .config import load_config


def _running(url: str) -> bool:
    """Comprobación de instancia única (solo contra 127.0.0.1)."""
    try:
        with urllib.request.urlopen(url + "/api/health", timeout=1.5) as r:
            return json.loads(r.read().decode()).get("app") == APP_ID
    except Exception:
        return False


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="kaosnt", description="KAOSnt (local)")
    ap.add_argument("--demo", action="store_true", help="Datos ficticios en una carpeta y puerto separados")
    ap.add_argument("--port", type=int)
    ap.add_argument("--data-dir")
    ap.add_argument("--no-browser", action="store_true")
    args = ap.parse_args(argv)

    logging.basicConfig(level=logging.WARNING, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    cfg, note = load_config(demo=args.demo, data_dir=args.data_dir, port=args.port)
    url = f"http://127.0.0.1:{cfg.port}"
    if _running(url):
        print(f"KAOSnt ya está en marcha en {url}")
        if not args.no_browser:
            webbrowser.open(url)
        return 0
    if note:
        print(note)
    cfg.ensure_dirs()
    app = create_app(cfg)  # aplica migraciones (con copia previa si la base ya tenía datos)
    if args.demo:
        from .demo import seed_if_empty
        seed_if_empty(cfg)
    server = uvicorn.Server(uvicorn.Config(app, host=cfg.host, port=cfg.port, access_log=False, log_level="warning", lifespan="on"))
    app.state.server = server

    def open_browser():
        for _ in range(50):
            if server.started:
                webbrowser.open(url)
                return
            time.sleep(0.2)

    print(f"KAOSnt {'(DEMO) ' if args.demo else ''}en {url}")
    print(f"Datos: {cfg.data_dir}")
    print("Para cerrar: «Cerrar aplicación» en Configuración, detener.bat o Ctrl+C en esta ventana.")
    if not args.no_browser:
        threading.Thread(target=open_browser, daemon=True).start()
    server.run()
    print("KAOSnt cerrado correctamente.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
