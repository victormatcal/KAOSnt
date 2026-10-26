# Data model

Schema: [`001_initial.sql`](../backend/kaosnt/migrations/001_initial.sql) + [`002_v02.sql`](../backend/kaosnt/migrations/002_v02.sql) +
[`003_v03.sql`](../backend/kaosnt/migrations/003_v03.sql) + [`004_v04.sql`](../backend/kaosnt/migrations/004_v04.sql).
Current version: **4** (`PRAGMA user_version`).

## Conventions
- Instants in UTC ISO-8601; calendar dates `YYYY-MM-DD`. Configurable display time zone (Europe/Madrid).
- Unknown = `NULL`, shown as «not provided» (never as 0).
- Stored values (statuses, kinds, rules, settings values…) are Spanish identifiers (`pendiente`, `en_curso`, `hoy`…);
  they are part of the data format and are translated only for display.

## Entities

| Table | Purpose |
|---|---|
| `clients` | Optional client (1:N projects; deleting → projects without a client) |
| `locations` | Office (unique name ignoring case) — *0.2* |
| `holidays` | Holiday: date, name, `location_id` (NULL = common). Unique per (date, office) — *0.2* |
| `people` | People (including «me»), optional weekly capacity, optional `location_id` (*0.2*). Can be deleted (*0.4*) except «me» |
| `projects` | Project/proposal: activity status, manual overall status + explanation, summary and date, next action… |
| `project_people` | N:M person-project with `role` and `dedication_pct` (*0.2*) |
| `groupings` | Workstream / phase / deliverable per project |
| `milestones` | Milestone, pending decision or commitment |
| `tasks` | Task (only `title` required): status + condition, assignee, reviewer, manual priority and position, dates, estimate, approval, wait/follow-up, reviews, `parent_id`, recurrence occurrence, `archived` |
| `task_steps` | Steps (checklist) of a task — *0.2* |
| `task_dependencies` | «task_id depends on depends_on_id»; no self-dependencies or cycles |
| `task_history` | History: `cambio` (automatic), `actualizacion` (manual, editable, `edited_at` *0.2*), `seguimiento` |
| `task_allocations` | Explicit weekly effort split |
| `notes`, `note_task_links` | Markdown notes (version for autosave) and links with an excerpt |
| `tags`, `task_tags`, `note_tags` | Unique reusable tags |
| `absences` | Absences by dates (no reason required) |
| `recurrences` | Recurring series; `template` (JSON, *0.3*) with the inherited fields, tags, steps and date offsets (planned, review and reminders) relative to the due date. NULL = 0.2 series |
| `undo_log` | Ephemeral snapshots for «Undo» (*0.3*). Not exported; expires after 15 min |
| `reminders` | Reminders with a persistent deduplication key |
| `saved_views`, `settings` | Saved views and preferences/session (JSON) |

## Main rules
- Priority never changes by itself; dependencies never change statuses; completing steps or subtasks does not complete the parent.
- Significant update: status, condition, description, manual update, follow-up or completed step. Opening, reordering, priority or dates are not.
- Holidays applying to a person = common + those of their office. Used in recurrences, working hours, availability and conflicts.
- Planning: explicit split or the full estimate in the planned week; estimated subtasks replace the parent; no estimate → listed apart.
- Deleting a person (*0.4*): `tasks.assignee_id`, `reviewer_id`, `wait_on_person_id` and `recurrences.assignee_id` become NULL
  (`ON DELETE SET NULL`) unless the user explicitly reassigns open tasks and series; `absences` and `project_people` rows are deleted
  (`ON DELETE CASCADE`); series templates are updated; a backup is created first.

## Migration 002
Creates `locations`, `holidays`, `task_steps`; adds `people.location_id`, `project_people.dedication_pct`, `task_history.edited_at`;
turns the 0.1 holiday list into common holidays and changes the default name to «KAOSnt». A previous backup is created first.

## Migration 003
Adds `recurrences.template` and `undo_log`; turns `workdays` + `work_start`/`work_end` into `work_schedule`
(`{"1": {"start","end"} | null, …, "7": …}`) and removes the old keys. A previous backup is created first.

## Migration 004
English becomes the default interface language for new installations. Existing databases (they already have people) get
`language = "es"` unless a language had been chosen, so upgrading does not change the interface. No table changes.

## Settings
- 0.3: `work_schedule`, `language` (`en`/`es`), `date_format`, `week_start` (1/7, display only), `theme_mode` (`sistema`/`claro`/`oscuro`),
  `theme_id`, `custom_themes` (only through `/api/themes`), `undo_seconds` (3–60), `group_recurring`. `note_tabs` includes `split`.
- 0.4: `task_panel_width` (px, 320–2000, `null` = default width). `language` defaults to `en`.

## Full export
`{"format": "kaosnt", "kind": "completa", "format_version": 1, "schema_version": 4, "app_version": "0.4.0", "exported_at": …, "tables": {…}}`.
Restoring accepts the same `schema_version` or 2 and 3 (later migrations are additive; the old working-hours format is converted
when read and pre-0.4 exports keep the Spanish interface); unknown tables/columns and broken relations are rejected.

## Server error responses
`{"code": "…", "message": "<rendered Spanish text>", "message_key": "<translation key>", "params": {…}, "tparams": […]}`.
The client shows `t(message_key, params)`, translating the params listed in `tparams` (entity names).
