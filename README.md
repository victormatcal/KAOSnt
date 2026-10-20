# KAOSnt · v0.2.0

Aplicación web **local** para organizar trabajo propio y de equipo: captura rápida de tareas y notas, resumen «Hoy»,
proyectos con «Dónde lo dejamos», Kanban/lista/calendario, equipo con festivos por oficina y planificación semanal.

- Un único usuario, sin cuentas. Funciona **sin Internet** una vez instalada.
- Escucha solo en `127.0.0.1`. Sin telemetría, CDN, IA integrada ni APIs externas.
- No es una herramienta oficial de ninguna organización y no usa logotipos corporativos.

> **Sin inicio de sesión no significa seguro.** Ver [docs/SEGURIDAD.md](docs/SEGURIDAD.md).
> Novedades de esta versión: [docs/CAMBIOS.md](docs/CAMBIOS.md).

## 1. Decisiones principales

| Tema | Decisión |
|---|---|
| Backend | Python 3.10+ · FastAPI · SQLite (WAL), un solo proceso |
| Frontend | React 19 + TypeScript, **compilado y entregado** en `frontend/dist` (el uso diario no necesita Node) |
| Empaquetado | `tsc` + micro-empaquetador propio (`frontend/tools/bundle.mjs`), sin dependencias extra |
| Datos | `%LOCALAPPDATA%\KAOSnt\` (fuera del código). Demo en `%LOCALAPPDATA%\KAOSnt-demo\` |
| Migraciones | SQL numerado + `PRAGMA user_version`, con copia previa automática |
| Markdown | Renderizador propio que genera elementos React (nunca `innerHTML`) |

## 2. Estructura

```
kaosnt/
├─ instalar.bat · iniciar.bat · iniciar-demo.bat · detener.bat · ejecutar-pruebas.bat
├─ requirements.txt · requirements-dev.txt
├─ backend/
│  ├─ kaosnt/            app.py (API y seguridad) · tasks.py · notes.py · recurrence.py · reminders.py
│  │                     views.py (Hoy, proyecto, persona, planificación) · agenda.py (oficinas, festivos, calendario)
│  │                     search.py · backup.py · demo.py · config.py · db.py · settings.py · timeutil.py · schemas.py
│  │   └─ migrations/    001_inicial.sql · 002_v02.sql
│  ├─ tests/             pytest (criterios de aceptación, seguridad, novedades 0.2)
│  └─ tools/gen_frontend_fixture.py
├─ frontend/  src/ (App.tsx, views/, components/, lib/) · dist/ (compilado) · tests/ · tools/
└─ docs/      GUIA_USO.md · MODELO_DATOS.md · PRUEBAS.md · SEGURIDAD.md · CAMBIOS.md
```

## 3. Instalación en Windows (una vez, con conexión)

Requisito: **Python 3.10 o superior** (`py -3 --version`). Node no es necesario para usar la aplicación.

1. Copia la carpeta `kaosnt` a una ruta tuya (p. ej. `C:\Users\<tú>\Apps\kaosnt`).
2. Doble clic en **`instalar.bat`** (crea `.venv` e instala FastAPI, Uvicorn, Pydantic y tzdata).

## 4. Uso diario

- **Iniciar**: `iniciar.bat` → consola minimizada y navegador en `http://127.0.0.1:8765`. Sin Internet.
- **Demo** (datos ficticios, separados): `iniciar-demo.bat` → `http://127.0.0.1:8766`.
- **Cerrar** (controlado): *Configuración → Cerrar aplicación*, `detener.bat` (demo: `detener.bat 8766`) o `Ctrl+C` en la consola.
- Opciones: `--port N`, `--data-dir RUTA`, `--no-browser`; variables `KAOSNT_DATA_DIR`, `KAOSNT_PORT`.

## 5. Actualizar desde la 0.1 («Centro de trabajo») o entre versiones

1. Haz una **exportación completa** (Configuración → Exportar) y cierra la aplicación anterior (`detener.bat`).
2. Sustituye la carpeta del programa por la nueva (no toques `%LOCALAPPDATA%`). Ejecuta `instalar.bat` e `iniciar.bat`.
3. Al arrancar, la 0.2 **renombra** `%LOCALAPPDATA%\CentroTrabajo` → `KAOSnt` (y `-demo`), y `centro.db` → `kaosnt.db`,
   crea `copias\kaosnt-…-previa-migracion.db` y aplica la migración 002. Si la carpeta antigua está en uso, sigue usándola y lo indica en la consola.
4. Los festivos de la 0.1 pasan a ser **festivos comunes** (todas las oficinas).

Una exportación JSON de la 0.1 no se puede restaurar directamente en la 0.2 (cambia el esquema); para eso usa una copia `.db`, que sí se actualiza al restaurarla.

## 6. Copias y restauración

Resumen (detalle en [docs/GUIA_USO.md](docs/GUIA_USO.md#copias-exportación-y-restauración)): copia automática diaria con retención
configurable, copia manual, copia previa a restaurar y a migrar, todas con la API de copia en línea de SQLite y verificación de integridad.
Exportaciones: completa (JSON restaurable), por proyecto, notas (ZIP Markdown) y tareas (CSV de consulta).

> Las copias locales están en el mismo equipo: **no sustituyen** una protección autorizada ante pérdida, robo o avería.

## 7. Desarrollo (solo para modificar el frontend)

```bat
cd frontend
npm install
npm run build      :: compila y genera frontend\dist
npm test
```
Pruebas del servidor: `.venv\Scripts\python.exe -m pip install -r requirements-dev.txt` y `ejecutar-pruebas.bat`.
Si cambian las respuestas de la API, regenera el fixture: `python backend\tools\gen_frontend_fixture.py`.

Estado de las pruebas y limitaciones: [docs/PRUEBAS.md](docs/PRUEBAS.md).
