# Short user guide

## Shortcuts

| Action | Shortcut |
|---|---|
| New task (only the title is required) | `Alt+T` |
| New note (empty, no title or project) | `Alt+N` |
| Search tasks, projects and notes | `Ctrl+K` or `/` |
| Go to Today / Projects / Work / Team / Notes | `Alt+1` … `Alt+5` |
| Back to the start screen | click the application name |
| Save the task details | `Ctrl+S` |
| Record an update / save a long text | `Ctrl+Enter` |
| Close a panel or dialog | `Esc` |
| Create a task from the selected text of a note | `Alt+Shift+T` |
| Close a note tab (does not delete it) | `Alt+W` |
| Markdown editor | `Tab`/`Shift+Tab` indent, `Enter` continues lists, `Ctrl+B`/`Ctrl+I`/`Ctrl+K` bold, italic and link, `Ctrl+Shift+C` code, `Ctrl+Shift+X` strikethrough, `Esc` then `Tab` leaves the text |
| Hide / show the notes side panel | `Alt+B` |
| Resize the task panel (handle focused) | `←` / `→` (`Shift` for bigger steps), `Home` / `End`, `Enter` = default width |

On the Kanban board, each card has ◀ ▲ ▼ ▶ buttons besides drag and drop. With the board grouped, drag a card to another
group (or use «⇄ Move to another group…») to change its assignee, project or grouping.

**Filters**: each filter accepts several values (e.g. two projects); values combine with «or» inside a filter and «and»
between filters. The active filters appear below the bar as «Filter: value ×» chips in a single line («+N more» shows the rest);
click × to remove one value. Filter by **client** in Work, Notes and Projects. Every screen keeps its filters and options while you move
to another screen and back (until the browser is closed); «Reset filters» clears them.

**Undo**: after marking done, cancelling, archiving, moving between columns, promoting, skipping an occurrence, resolving a wait,
handling/snoozing/dismissing a reminder, archiving or trashing a note, «Archive all» or meeting a milestone, the notice at the
bottom shows «Undo» with a progress bar (8 s by default; *Settings → General*). Permanent deletion cannot be undone.

**Dates**: typed and shown in the configured format (dd/mm/yyyy by default) with a pop-up calendar (📅 or `Alt+↓`;
arrows to move, `PgUp/PgDn` to change month). Times in 24 h (HH:MM).

## Recommended flow
1. **Capture without filing**: `Alt+N` and type (it saves itself: *Saving… / ✓ Saved / ⚠ Error*), or `Alt+T` with just the title.
2. **File later**: in *Notes → Unfiled* link to a project, mark as minutes/decision/documentation, add tags or create a task from an excerpt.
3. **Start the day in Today**: due dates of the week (including Backlog with a date), reviews and reminders, external blockers, what depends on you and the team with their absences and holidays.
4. **Work in Work**: Kanban, List, Calendar or Archived, with filters and saved views.
5. **Before a meeting**, open the project: «Where we left off», next action, signals, decisions, commitments, tasks and notes.

## Tasks
- **Status** (Backlog → Pending → In progress → In review → Done; Cancelled) and an independent **condition** (Waiting / Blocked).
- The details are organised in collapsible sections; only one is open at a time.
- **Task panel width**: drag the handle on the left edge of the panel (or focus it and use the arrow keys). Double click or `Enter` restores the default width. The width is remembered.
- **Steps** (internal checkboxes) or **subtasks** (full tasks, visible in every view with «↳ Subtask of…»). A step can become a subtask.
- **Changing a recurring task**: when you save a change to an occurrence (or move it to another group), choose whether it applies to *only this occurrence*, *this and the following ones* or *all occurrences* (including past, finished and cancelled ones). Status, history and due dates are never copied. In *Work → ↻ Recurring*, editing a series asks *only new occurrences*, *from today* or *all*.
- **Subtasks in Kanban and List**: subtasks in the same column as their parent fold under it with «⊞ +N» (switch «Group subtasks»).
- **Repetition**: «Make recurring» with any rule (e.g. Monday and Wednesday). Occurrences inherit everything (project, assignee, reviewer, type, priority, estimate, description, groupings, parent task, approval, reviews, links, tags, unchecked steps and reminders) and dates keep their relation to the due date. «Delete series»: keep the occurrences as normal tasks or also delete the pending ones. Manage every series in *Work → ↻ Recurring*.
- **Series in Kanban and List**: one card per series and status with «↻ +N»; click to expand it (↻ − to group it again). «Group recurring series» switch. The calendar shows all of them, in italics with ↻.
- **Archive all**: with the Done column visible, button in its header (with confirmation and undo).
- **Reminders**: the 🔔 bell opens the centre (Pending, Scheduled, Resolved). In Today, «Scheduled this week»; in the task details, its own.
- **History**: your updates (editable) and automatic changes (read only).
- **Tags**: type and pick an existing one or press Enter to create it. Rename or delete them in *Settings → Tags*.
- **Archive** hides the task; in *Work → Archived* you can restore it or delete it permanently.
- **Split effort across weeks** (optional, only with an estimate): for large tasks spanning several weeks; without a split, planning counts the whole estimate in the week of the planned date.

## Team, offices and holidays
- *Settings → Offices and holidays*: create offices and register **common** or **office** holidays.
- *Team → Edit person*: office and weekly capacity (optional). Untick «Active» to hide someone and keep their history.
- *Team → Edit person → Delete person…* (not available for «me»): shows what will be affected and lets you leave their open tasks and series unassigned or reassign them to another person. Finished tasks are never reassigned; absences and project allocations are deleted. A backup is created first and it cannot be undone.
- *Project → People and allocation*: % of each person's capacity allocated to that project.
- *Settings → Offices and holidays → Bulk import holidays*: paste or upload a CSV `day;name;office` (e.g. `29/01/2026;San Valero;Zaragoza`), review the per-line preview and import. Tick «Create offices that do not exist» if needed.
- *Settings → Working hours*: hours per day (e.g. Mon–Thu 9:00–19:00, Fri 9:00–15:00, Sat–Sun non-working).
- *Team → Weekly planning*: registered estimated effort, availability (capacity × share of the week's working hours left after holidays and absences) and per-project breakdown. Tasks without an estimate are listed apart; nothing is split or reassigned automatically. It does not measure performance.

## Projects and clients
- *Projects → Clients*: create, rename or delete clients. Each project's client is changed with its picker.
- «Why» of the overall status: explanation shown in the project list.
- **Delete project** (besides archiving): unlink its content or delete it (notes go to the trash). A backup is created first.

## Notes
- Closing a tab never deletes or archives. When reopening, tabs, order and the active note are restored.
- Title suggested from the first line; a manual title is never overwritten.
- If saving fails, the text is kept (also in an emergency copy in the browser) and you can retry.
- Recoverable archive and trash; permanent deletion only from the trash (the note disappears from the tabs).
- **Filters**: text (title and/or content), project (or «No project»), type and tag.
- **Reorder tabs** by dragging them (or `Alt+←/→`).
- **Side panel**: «⟨» or `Alt+B` hides it (the note uses the whole width; «⟩» brings it back). The «Filters» header folds only the filters and shows how many are active.
- **Editor**: *Edit*, *Live* (editor and result side by side; scrolling synchronised — switch «Sync scrolling»; click a block of the result to jump to its line) or *Preview* (the last one used is remembered). Toolbar for headings, emphasis, code, links, quotes, lists, checkboxes, tables and separators; checkboxes can be ticked in the preview. Opening a note from the search (Ctrl+K) puts the caret at its last line.
- **Split screen** (◫): two editable notes side by side; choose the right one among the open notes. On narrow screens they stack.

## Appearance and language
- *Settings → General*: interface language (English/Spanish), date format and week start. New installations start in English; databases created before 0.4 keep Spanish.
- *Settings → Appearance*: Light, Dark or Follow the system; built-in or imported themes (see [THEMES.md](THEMES.md)).
- Your data (task titles, notes, names…) is never translated. Automatic history entries are stored in Spanish.

## Danger zone
*Settings* is organised by sections (side index). Sections with a form have their own «Save» button and warn if you leave with unsaved changes.

*Settings → Danger zone → Delete everything*: type the application name or «BORRAR TODO». A `…-previa-borrado.db` backup is
created first (its name is shown) and the application is left as freshly installed (the interface language is kept).
In the demo you can reload the fictitious data.

## Backups, export and restore

| What | Where |
|---|---|
| Daily automatic backup | `%LOCALAPPDATA%\KAOSnt\copias\kaosnt-YYYYMMDD-HHMMSS-auto.db` (configurable retention) |
| Manual backup | Settings → *Create backup now* |
| Previous backup | `…-previa-restauracion.db` / `…-previa-migracion.db` / `…-previa-borrado.db` (delete everything, delete project, delete person) |
| Full export (restorable) | Settings → Export (JSON) |
| Project / Notes / Tasks | Project screen · Markdown ZIP · CSV (`;`, UTF-8) |

**Restore**: from a backup (*Restore* button) or from a full export («Current / After restore» is shown before confirming).
A backup of the current state is always created first. Manually, with the app closed: copy a `.db` from `copias\` over
`kaosnt.db` and delete `kaosnt.db-wal`/`-shm`.
