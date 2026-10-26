# Tests

## Environment
Linux (development container) · Python 3.12 · FastAPI 0.136.3 · Uvicorn 0.35.0 · Pydantic 2.12.5 · SQLite 3.44 ·
Node 24 · TypeScript 6 · React 19.2.1. **Not run on Windows or in a real browser** (no browser was available).

## Version 0.4 — run and passed

Baseline before any change (code from the repository ZIP): server 82/82. On a previous attempt the frontend gave 25/26 because
the «Work» render test depended on the week the fixture was generated in (fixed, see below).

### Server: 92 of 92 (82 previous + 10 new in `tests/test_v04.py`)
- Delete a person: preview counts (open/finished tasks, reviewer and «waiting on» references, series, absences, projects);
  explicit confirmation; previous `…-previa-borrado.db` backup; references cleared, absences and allocations deleted, series
  templates updated, history entry on affected tasks; Today and planning still respond.
- Delete a person reassigning open work: open tasks and series (and the template) move to the chosen person; finished tasks are not reassigned.
- Rules: «me» cannot be deleted (`es_yo`), no reassignment to the same or a missing person, 404 with a translatable key,
  and no backup is created when the request is rejected.
- `task_panel_width` setting: default `null`, limits 320–2000, integers only, back to `null`.
- English by default: new installation → `language = "en"` and «Me»; a database created by 0.3 (schema 3) migrates to 4 keeping
  `es` and «Yo», with a previous backup; «Delete everything» keeps the language; restoring a 0.3 export keeps Spanish.
- Server messages: `message_key`/`params`/`tparams` (including validation errors); entity names passed to `not_found`/`missing_ref`
  are known keys and no message is an f-string.
- The 82 previous tests were renamed to English and adapted where the behaviour changed on purpose: schema version 4,
  «Me» after deleting everything, «Note of …» as the generated note title.

### Frontend: 31 of 31 (26 previous + 5 new in `tests/v04.test.tsx`) and `tools/i18n-keys.mjs` (1061 keys, all translated, now including the server messages)
- English by default and Spanish as the fallback; Today rendered in English.
- `serverMessage()`: translated keys and entity params, untranslated keys shown as they are, old responses without a key.
- Panel width: limits, default width, keyboard steps (←/→, Shift, Home/End); the handle is an accessible `separator`
  (`aria-valuenow`, focusable) and the layout CSS keeps 360 px for the main view.
- Delete person dialog: summary lines, «leave unassigned» / «reassign to» options, the person is not offered as a target.
- The previous test files explicitly switch to Spanish (`setLang("es")`) because they check the Spanish texts.
- Date independence: the frontend tests were also run with the clock moved −30, +10 and +45 days (all passed).

### Real server (`python -m kaosnt`)
- A database created with the **real 0.3 server** (a person and a task assigned to them) opened with 0.4: `…-previa-migracion.db`,
  `user_version` 4, `language = es`; then `task_panel_width` saved, delete preview, deletion with reassignment (the task moved
  to «me»), deleting «me» rejected with `es_yo`; `index.html` and `app.js` served; controlled shutdown with English console messages.
- New data folder: `language = en` and «Me». `--demo`: Today, planning, reminders, search and the delete preview respond.
- Spanish strings without `t()` detector (`npm run i18n`): only «Español» in the language selector remains, on purpose.

## Pending verification on your computer (0.4)
- **I could not open a real browser.** Not checked visually: the resize handle (drag, cursor, keyboard focus, double click),
  the width limits on small windows and in the narrow overlay mode, the delete person dialog, and the whole interface in
  English (texts that may overflow because English and Spanish lengths differ).
- Windows: the renamed `.bat` files (`install.bat`, `start.bat`, `start-demo.bat`, `stop.bat`, `run-tests.bat`) and the
  migration with **your** 0.3 data (a previous backup is created).
- Pointer capture while dragging depends on the browser.

## Version 0.3 — run and passed

### Server: 82 of 82 (49 previous + 33 new in `tests/test_v03.py`)
- Working hours per day: short Friday (Mon–Thu 9–19, Fri 9–15) with `add_hours` and `business_hours_between` in the week of the daylight saving change (25/10/2026); full week = 46 h; setting validation; proportional availability (46 h × 40/46 with the Friday as a holiday); working-day recurrences.
- Migration from a 0.2 database (schema 2): previous backup, `workdays/work_start/work_end` → `work_schedule`, a series without a template keeps generating.
- Undo: exact fields (`status`, `completed_at`, `started_at`, `position`, `last_significant_update`, `archived`), only once, expiry, moving columns, resolving a wait (restores `wait_since`), skipping an occurrence, note to the trash, handled reminder, met milestone; bulk archive in one transaction with joint undo.
- Themes: valid built-ins with contrast ≥ 4.5:1; URLs, free CSS, unknown variables and fonts, reserved id rejected; import, select and delete; validation of language, date format, week start, mode and undo seconds.
- Bulk holidays: header, `;`/`,`/tab separators, ISO and dd/mm/yyyy, duplicates (existing and repeated), impossible date, unknown office never common, preview without saving, creating offices.
- Reminder centre: scheduled (also per task and «this week» in Today), edit, handle, resolved, reopen, cancel; automatic ones cannot be edited or cancelled.
- Recurring: full inheritance shifting planned date, review and reminders; unchecked steps; deleted references do not break generation; «Apply to the series»; delete series (keep / delete pending); one entry per series in Today and notices only for the oldest.
- Delete everything (confirmation, previous backup, «me», default name) and in the demo reloading fictitious data; delete project (unlink / delete, previous backup, notes to the trash).
- Notes: filters by text (title/content, accent-insensitive), project and «no project»; tabs with `split`; a purged note disappears from the tabs.
- Restoring an export with schema 2 (converts the old working hours).

### Frontend: 26 of 26 (19 previous + 7 new in `tests/v03.test.tsx`)
- Date formats and validation; week start in calendars without affecting planning; `DateInput` with the configured format and no `input type="date|time|datetime-local"`.
- English with Spanish fallback, translated labels and server texts.
- Valid built-in themes, contrast, client validation, template, and `themes-data.ts` matching `themes/*.json`.
- Series grouping (oldest open / most recent finished, «↻ +N», expanded) and the «Archive all» button.
- Note filter query and tab reordering by drag; per-day «Working» text; Settings with Appearance, Danger zone, language, bulk holidays and working hours.

## Version 0.2 — run and passed

### Server: 49 of 49
- **Criteria 1–18** (`test_criteria.py`): the same as in 0.1, adapted. Also: the dependency history shows titles, not numbers; export/restore keeps steps, offices, holidays and allocation.
- **Security and logic** (`test_security_and_logic.py`): foreign Host (421); writes without `X-KAOSnt`, with a foreign Origin or cross-site (403); CSP; dangerous links; unknown fields; pending approval warning; anti-formula CSV; notes ZIP; single daily backup and retention (also with 0.1 backups); working hours with the daylight saving change; suggested title; manual reminder; criteria 19/20 (only 127.0.0.1 and no external resources in the bundle).
- **0.2 features** (`test_v02.py`): real migration of a 0.1 database; holidays per office; clients; allocation per project; making an existing task recurring; editable manual history; steps and subtasks; archived tasks; tags; linked note created from a task.

### Frontend: 19 of 19
- Autosave (failure, retry, edits while saving, conflict), calendar time, Europe/Madrid dates, quiet hours, safe links, configurable home, repetition description.
- Server-side rendering with real API data: KAOSnt name linked to the start screen; Today without repeated cards and with the team as a list; Work with Archived, Recurring and the availability strip; calendar with holidays and absences; subtask card with the parent name and counters; single-open accordion; tag chips; project with editable client, allocation, status explanation and next action in text areas; Settings with offices, holidays and tags; safe Markdown.

## Not run (pending on your computer)
- **Look in a real browser**: overflows and no horizontal scroll (fixed in CSS but not measured), text area auto-height, tag and task drop-downs, accordion, drag and drop, dialogs, notifications.
- **Windows**: `.bat` files, renaming `%LOCALAPPDATA%\CentroTrabajo` (if 0.1 is still open it is not renamed and the old folder is used), `tzdata`.
- Running with the network physically disconnected (verified indirectly).
- `npm install` + `npm run build` with the official React types (here it was compiled with the minimal types in `frontend/tools/sandbox`).
- Python 3.10/3.11 (only 3.12), large volumes, screen readers.

## Known limitations
- No alerts while the application is closed; on reopening they are recalculated and grouped.
- Restore is always full; it accepts the same schema or those of 0.2 and 0.3 (for 0.1 data, use a `.db` backup).
- «Undo» expires after 15 min and does not cover note content edits or permanent deletions (including deleting a person).
- Series created in 0.2 have no full template until «Apply this data to the series» is pressed in an occurrence.
- No own encryption or authentication.
- Working hours with a single slot per day (no lunch break), different for each day.
- Holidays are registered by hand (no official calendars are imported).
- The rule and start of a recurring series cannot be edited (pause it and create another).
- Steps have no assignee or dates (convert them into a subtask for that); their order is the creation order.
- The manual Kanban order is global per status.
- **Language (0.4)**: data generated by the server and stored in the database stays in Spanish whatever the interface language:
  automatic task history entries (e.g. «Persona eliminada del equipo: …»), the demo data and the names of data folders and
  backup files. Reminder titles and labels are translated in the client.
