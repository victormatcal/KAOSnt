# Changes in 0.4.0

| Request | What was done |
|---|---|
| Repository in English | README and every document under `docs/` rewritten in English (and renamed: `CHANGES.md`, `USER_GUIDE.md`, `DATA_MODEL.md`, `TESTING.md`, `SECURITY.md`, `THEMES.md`). Comments, docstrings, identifiers, test names, CLI/log messages and tool output in English. Files renamed: `install.bat`, `start.bat`, `start-demo.bat`, `stop.bat`, `run-tests.bat`, `themes/` (was `temas/`), `001_initial.sql`, `test_criteria.py`, `test_security_and_logic.py`, `themes/example-my-theme.json`. Internal UI identifiers moved to English (note save states, reminder tabs, calendar scale, panes, tabs, CSS classes). **Not changed (as agreed):** translation keys (Spanish text in `t("…")` and in server messages) and values stored in the database or sent by the API (`pendiente`, `en_curso`, `hoy`, `sistema`, `dd/mm/aaaa`, theme ids…), plus data folder/backup file names (`copias`, `…-previa-migracion.db`) and browser storage keys, so existing data keeps working. |
| English by default | New installations start in English and create the «me» person as «Me». Migration **004** keeps `language = "es"` for existing databases (they already have people), so an upgrade does not change your interface; restoring a pre-0.4 export does the same. «Delete everything» keeps the interface language. Generated (not stored) note titles follow the language («Note of …» / «Nota del …»). |
| Server messages translated | Server errors are now translation keys with parameters (`message_key`, `params`, `tparams`) and the client renders them with `t()`; entity names (`Proyecto`, `Persona`…) are translated too. `tools/i18n-keys.mjs` also collects the backend keys, and a backend test forbids f-string messages. Search results carry structured context (project, kind, archived) so the client shows it in the interface language. |
| Resizable task panel | Handle on the left edge of the task detail panel: drag with mouse, pen or touch; keyboard with ←/→ (Shift = bigger steps), Home/End (maximum/minimum) and Enter or double click (default width). It always leaves at least 360 px for the main view and the panel never goes below 360 px. The width is saved in the `task_panel_width` setting (320–2000 px, validated by the server) when the gesture ends. On narrow windows (overlay panel) the width is capped at the window width. |
| Delete team members | *Team → Edit person → Delete person…* (not available for «me»). The dialog shows what is affected (open and finished tasks, reviewer and «waiting on» references, recurring series, absences, project allocations) and lets you leave the open tasks and series unassigned or **explicitly** reassign them to another person; finished tasks are never reassigned. A verified backup (`…-previa-borrado.db`) is created first; absences and allocations are deleted, references are cleared and series templates are updated; affected tasks get a history entry. Deactivating («Active») is still the way to hide someone while keeping their history. |
| Repository clean-up | Removed the leftover 0.1 package `backend/centro/` and the committed `__pycache__` folders (they were not used). The `.bat` files were stored in the repository with Unix line endings: they are back to Windows (CRLF) and a `.gitattributes` keeps them that way. |
| Date-dependent test | The «Work» render test failed when run in a different week from the one the fixture was generated for. The test now moves the fixture's week data to the current week; checked by running the frontend tests with the clock shifted −30, +10 and +45 days. |

---

# Changes in 0.3.0

| Request | What was done |
|---|---|
| 1. Undo | Bottom notice with «Undo» and a progress bar (8 s by default, configurable 3–60 s) after marking done, cancelling, archiving, moving between columns, promoting, skipping an occurrence, resolving a wait, handling/snoozing/dismissing a reminder, archiving or trashing a note, bulk archiving and meeting a milestone. The server stores a snapshot of the whole row (`undo_log`) and restores it exactly (including `completed_at`, `started_at`, `position`). It expires after 15 min and can only be applied once. Permanent deletion keeps its confirmation and has no undo. |
| 2. Dark mode | Light, Dark or Follow the system (listens to `prefers-color-scheme`). Every fixed colour in the CSS became a variable. The last appearance is applied before the first render from `localStorage`; without it, the CSS follows the system dark mode (no white flash). |
| 3. JSON themes | Declarative format `kaosnt-theme` v1 validated on the server (`themes.py`) and the client (`lib/theme.ts`): only #hex/rgb(a)/hsl(a) colours, a font from a closed list and a 0–16 radius. Built-in: Default, Minimalist, Cupertino, Retro and High contrast, all with text contrast ≥ 4.5:1 in light and dark (checked by tests). Import, use, delete and «Download template of current theme». `themes/` folder with an example and [THEMES.md](THEMES.md). |
| 4. Bulk holidays | Paste text or upload a CSV «day;name;office» (`;`, `,` or tab; optional header; dd/mm/yyyy or YYYY-MM-DD; empty or «Común» = all). Per-line preview (will be imported / duplicate / error with a reason). «Create offices that do not exist»; an unknown office never becomes a common holiday. |
| 5. Dates | Configurable format (dd/mm/yyyy by default, yyyy-mm-dd, mm/dd/yyyy) and week start Monday or Sunday in calendars. New `DateInput` (text + pop-up calendar, applied as soon as the date is valid), `TimeInput` (24 h) and `DateTimeInput` (configured time zone). No `input type="date/time/datetime-local"` is left. Internally still YYYY-MM-DD and planning is Monday to Sunday. |
| 6. Visible reminders | Centre in the 🔔 bell: Pending, Scheduled (future and snoozed) and Resolved; edit and cancel manual ones, reopen resolved ones. In Today, «Scheduled this week». In the task details, its own reminders. The creation notice says where to find it. |
| 7. Archive all | In the visible Done column: confirmation, bulk endpoint in one transaction (`/api/tasks/archive-bulk`) and undo as a whole. |
| 8. Spanish and English | `t("text", {vars})` with Spanish as the key and `src/i18n/en.ts`; if missing, Spanish is shown. Persistent selector in Settings. Server texts (reminder types, reasons) translated in the client. `tools/i18n-keys.mjs` in `npm test` (also detects `t` used as a variable and `t()` with templates). |
| 9. Uncluttered recurring tasks | Kanban and List: one card per series and status (oldest open or most recent finished) with «↻ +N», expandable; «Group recurring series» switch. Calendar: all of them, in italics with ↻. Today: one entry per series with «+N this week». Automatic notices only for the oldest open occurrence; repeated ones are grouped. |
| 10. Full inheritance | Migration 003 `recurrences.template`. Everything requested is inherited (including unchecked steps and manual reminders) and dates keep their relation to the due date. Pending form changes are saved before creating the series. «Apply this data to the series» updates the template and the pending future occurrences. Deleted references are dropped without breaking generation. |
| 11. Delete series | Keep the occurrences as normal tasks or also delete the pending ones (not started and skipped). Done ones (and those in progress or in review) are always kept. Explicit confirmation. |
| 12. Delete everything | «Danger zone»: type the application name or «BORRAR TODO», previous `…-previa-borrado.db` backup with its name shown, leaves the app as freshly installed with the «me» person. In the demo, option to reload the fictitious data. |
| 13. Working hours per day | `work_schedule` setting per ISO day (start/end or non-working), migrated from `workdays`/`work_start`/`work_end`. Used by `add_hours`, `business_hours_between`, working-day recurrences, availability (proportional to the real hours of each day) and the «Working: …» summary. Tests with a short Friday and the daylight saving change. |
| 14. Delete projects | «Delete project» with a previous backup and two options: unlink (tasks, notes and recurrences are kept without a project) or delete (tasks and recurrences are deleted; notes go to the trash). |
| 15. Reorder open notes | Drag and drop the tabs (Alt+←/→ kept as the keyboard alternative). The order is saved in the session. |
| 16. Filter notes | Text (title and content, title only or content only; ignoring case and accents), project (including «No project»), type and tag. «Clear filters». |
| 17. Deleted note left open | Deleting it permanently removes it from the tabs and the split pane; a tab pointing to a note that no longer exists (404) also closes itself. |
| 18. Split screen | «◫ Split screen»: two editable notes at once, each with its own autosave. `minmax(0,1fr)` grid without horizontal scroll; below 1100 px they stack. The right note is chosen from the open ones and remembered. |

---

# Changes in 0.2.0 (from the 0.1 feedback)

| Request | What was done |
|---|---|
| «KAOSnt» name | Default name, tab title, scripts, data folders (`KAOSnt`, `KAOSnt-demo`), backups (`kaosnt-…db`), Python package `kaosnt`. Automatic migration from 0.1. |
| Holidays per location | New **Office** entity. **Common** or **office** holidays; each person has an optional office. Recurrences, working hours, availability and conflicts use the holidays that apply to each person. |
| Holidays and absences visible in Work | Calendar: discreet grey line per day (holiday and office, absent people; hovering shows who is affected). Kanban/List: one-line «Unavailable this week» strip. Today: the week's holidays and absences under each person. |
| App name → home | The header name leads to the configured start screen (or the last view, if configured so). |
| Client management | *Projects → Clients*: create, rename and delete (projects are kept). In each project, an editable client picker with «+ New client…». |
| Short status explanation | Now a wide text area that grows with its content (with a limit) and is **shown** on the project card in the list. |
| Small «Next action» | Full-width text area that grows with its content. The same for objective, phase, wait reason and next action, description, updates and follow-up. |
| Weekly capacity | Now really used: **available** = capacity × working days after registered holidays and absences. New **allocation per project** (% of capacity) and per-project breakdown in planning (allocation vs. estimated effort). |
| Recurring tasks | **Repetition** section in the details of any task («Make recurring»: daily, working days, specific weekdays —e.g. Monday and Wednesday— or every X days). Also in «+ Task → More fields → Repeats» and in *Work → ↻ Recurring*. |
| Editable history | Manual updates can be edited (marked «edited»); automatic ones cannot. They are visually distinct. Large text area with Ctrl+Enter. |
| Confusing weekly split | Renamed to «Split effort across weeks (optional)», with an explanation, the total split and only visible when the task has an estimate. |
| Subtasks | Two options: **Step** (checkbox inside the task, not shown in views) or **Subtask** (full task, visible in every view with «↳ Subtask of "Title"»). A step can become a subtask. The parent shows counters. Fixed the «#1»: the name is shown. |
| See archived tasks | *Work → Archived*: list with Restore and Delete permanently. |
| Tags | Picker with suggestions from existing tags; Enter creates a new one; chips with ×. Unique ignoring case. Managed in *Settings → Tags* (rename —merges if it matches— and delete). Tag filter in Notes too. |
| Task menus | Accordion: opening a section closes the previous one. |
| Linked notes | «+ New linked note» button (inherits the task project). |
| `#number` before tasks | Removed. Tasks are searched and shown by title with context (project · status · assignee), also in the history. |
| Overflows and horizontal scroll | Wrapping texts, grids that adapt to the width, long paths broken, tables with their own scroll and Today's team summary as a compact list. The page only scrolls vertically. |
