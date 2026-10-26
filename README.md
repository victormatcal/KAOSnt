# KAOSnt · v0.5.0

A **local** web application to organise your own work and a small team's: quick capture of tasks and notes, a «Today»
summary, projects with «Where we left off», Kanban/list/calendar, team with holidays per office and weekly planning.

- Single user, no accounts. Works **without Internet** once installed.
- Listens only on `127.0.0.1`. No telemetry, CDN, built-in AI or external APIs.
- It is not an official tool of any organisation and uses no corporate logos.
- Interface in **English** (default) and **Spanish** (*Settings → General → Interface language*).

> **No sign-in does not mean secure.** See [docs/SECURITY.md](docs/SECURITY.md).
> What is new in this version: [docs/CHANGES.md](docs/CHANGES.md).

## 1. Main decisions

| Topic | Decision |
|---|---|
| Backend | Python 3.10+ · FastAPI · SQLite (WAL), a single process |
| Frontend | React 19 + TypeScript, **compiled and shipped** in `frontend/dist` (daily use does not need Node) |
| Bundling | `tsc` + own micro-bundler (`frontend/tools/bundle.mjs`), no extra dependencies |
| Data | `%LOCALAPPDATA%\KAOSnt\` (outside the code). Demo in `%LOCALAPPDATA%\KAOSnt-demo\` |
| Migrations | Numbered SQL + `PRAGMA user_version`, with an automatic previous backup |
| Markdown | Own renderer that produces React elements (never `innerHTML`) |
| Translations | `t("Spanish text", {vars})`: the Spanish text is the key, English lives in `frontend/src/i18n/en.ts`. Server messages are keys too and are translated in the client |

## 2. Layout

```
kaosnt/
├─ install.bat · start.bat · start-demo.bat · stop.bat · run-tests.bat
├─ requirements.txt · requirements-dev.txt
├─ themes/          built-in themes (JSON) and an example
├─ backend/
│  ├─ kaosnt/       app.py (API and security) · tasks.py · notes.py · people.py · recurrence.py · reminders.py
│  │                views.py (Today, project, person, planning) · agenda.py (offices, holidays, calendar) · themes.py · undo.py
│  │                search.py · backup.py · demo.py · config.py · db.py · settings.py · timeutil.py · schemas.py · errors.py
│  │   └─ migrations/  001_initial.sql · 002_v02.sql · 003_v03.sql · 004_v04.sql
│  ├─ tests/        pytest (acceptance criteria, security, 0.2, 0.3, 0.4 and 0.5 features)
│  └─ tools/gen_frontend_fixture.py
├─ frontend/  src/ (App.tsx, views/, components/, lib/, i18n/) · dist/ (compiled) · tests/ · tools/
└─ docs/      USER_GUIDE.md · DATA_MODEL.md · TESTING.md · SECURITY.md · THEMES.md · CHANGES.md
```

## 3. Installing on Windows (once, with a connection)

Requirement: **Python 3.10 or later** (`py -3 --version`). Node is not needed to use the application.

1. Copy the `kaosnt` folder to a path of yours (e.g. `C:\Users\<you>\Apps\kaosnt`).
2. Double-click **`install.bat`** (creates `.venv` and installs FastAPI, Uvicorn, Pydantic and tzdata).

## 4. Daily use

- **Start**: `start.bat` → minimised console and browser on `http://127.0.0.1:8765`. No Internet needed.
- **Demo** (fictitious data, kept apart): `start-demo.bat` → `http://127.0.0.1:8766`.
- **Close** (controlled): *Settings → Close application*, `stop.bat` (demo: `stop.bat 8766`) or `Ctrl+C` in the console.
- Options: `--port N`, `--data-dir PATH`, `--no-browser`; environment variables `KAOSNT_DATA_DIR`, `KAOSNT_PORT`.

## 5. Upgrading from 0.4 to 0.5

1. In 0.4: **Settings → Export → Full export** (for safety) and close the application (`stop.bat` or «Close application»).
2. Replace the program folder with the 0.5 one (do not touch `%LOCALAPPDATA%\KAOSnt`) and run `start.bat`.
   There are no new dependencies and **no database migration** (schema 4 is kept); only two new settings
   (`group_subtasks`, `note_editor_mode`) that take their default value.
3. What changes for you: filters with multiple choice and a client filter, screens that keep their state while you move
   between them, Kanban cards that can be moved between groups, a scope question when changing a recurring task, subtasks
   folded under their parent, a more complete Markdown editor and Settings organised by sections.
   «Apply this data to the series» is gone: the scope question replaces it.

## 5 bis. Upgrading from 0.3 to 0.4

1. In 0.3: **Settings → Export → Full export** (for safety) and close the application (`detener.bat` or «Close application»).
2. Replace the program folder with the 0.4 one (do not touch `%LOCALAPPDATA%\KAOSnt`). The `.bat` files are now in English:
   run **`install.bat`** (the `.venv` lives in the program folder; there are no new dependencies) and then **`start.bat`**.
   Delete old shortcuts to `iniciar.bat` / `iniciar-demo.bat` if you had any.
3. On start, `copias\kaosnt-…-previa-migracion.db` is created and migration **004** (additive) is applied:
   your existing data keeps the **Spanish** interface; only new installations start in English.
4. A JSON export from 0.3 (or 0.2) **can** be restored in 0.4.
5. New: the task panel width can be changed by dragging its left edge (it is remembered), and in *Team → Edit person* you can delete people.

Upgrading from 0.2: same steps (migrations 003 and 004 are applied in a row). From 0.1 («Centro de trabajo»): see section 5 ter.

## 5 ter. Upgrading from 0.1 («Centro de trabajo»)

1. Make a **full export** (Settings → Export) and close the previous application.
2. Replace the program folder with the new one (do not touch `%LOCALAPPDATA%`). Run `install.bat` and `start.bat`.
3. On start, `%LOCALAPPDATA%\CentroTrabajo` is **renamed** to `KAOSnt` (and `-demo`), and `centro.db` to `kaosnt.db`;
   `copias\kaosnt-…-previa-migracion.db` is created and every migration is applied. If the old folder is in use, it keeps
   being used and the console says so.
4. 0.1 holidays become **common holidays** (all offices).

A JSON export from 0.1 cannot be restored directly (the schema changed); use a `.db` backup instead, which is upgraded when restored.

## 6. Backups and restore

Summary (details in [docs/USER_GUIDE.md](docs/USER_GUIDE.md#backups-export-and-restore)): daily automatic backup with
configurable retention, manual backup, previous backup before restoring, migrating or deleting, all with the SQLite online backup
API and an integrity check. Exports: full (restorable JSON), per project, notes (Markdown ZIP) and tasks (read-only CSV).

> Local backups live on the same computer: they **do not replace** an authorised protection against loss, theft or failure.

Data folder names (`copias`) and backup file names (`…-previa-migracion.db`, `…-previa-borrado.db`…) are kept as they were
so existing backups keep working.

## 7. Development

```bat
cd frontend
npm install
npm run build      :: generates src/lib/themes-data.ts from themes/, compiles and writes frontend\dist
npm test           :: checks translations (tools/i18n-keys.mjs), compiles and runs the tests
npm run i18n       :: lists keys without translation and Spanish texts without t()
```
Without `npm install` (no Internet): `tsc -p tools/sandbox/tsconfig.json` and `tsc -p tools/sandbox/tsconfig.test.json` use the
minimal React types in `frontend/tools/sandbox`.

- Server tests: `.venv\Scripts\python.exe -m pip install -r requirements-dev.txt` and `run-tests.bat`.
- If API responses or the demo change, regenerate the fixture: `python backend\tools\gen_frontend_fixture.py`.
- Conventions: code, comments, identifiers and documentation in English. User-facing texts are translation keys written in
  Spanish (`t("…")` in the frontend; `invalid("…")`, `not_found("…")` in the backend) and need an entry in `src/i18n/en.ts`.
  Values stored in the database (`pendiente`, `en_curso`, `hoy`…) are kept as they are.
- Themes: [docs/THEMES.md](docs/THEMES.md) and the `themes/` folder.

Test status and limitations: [docs/TESTING.md](docs/TESTING.md).
