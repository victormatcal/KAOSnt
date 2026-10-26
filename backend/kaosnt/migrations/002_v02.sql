-- KAOSnt 0.2 · offices and holidays per office, allocation per project, task steps,
-- editing manual updates. Additive migration: no data is deleted.

CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL
);

-- location_id NULL = holiday for every office
CREATE TABLE holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_holidays ON holidays(date, IFNULL(location_id, 0));

ALTER TABLE people ADD COLUMN location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;

-- A person's allocation to a project (% of their weekly capacity). NULL = not provided
ALTER TABLE project_people ADD COLUMN dedication_pct REAL;

ALTER TABLE task_history ADD COLUMN edited_at TEXT;

-- Steps: lightweight checklist inside a task (not shown on the board/list/calendar)
CREATE TABLE task_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  done INTEGER NOT NULL DEFAULT 0,
  position REAL NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  done_at TEXT
);
CREATE INDEX ix_steps_task ON task_steps(task_id);

-- 0.1 holidays (single list in the settings) become holidays for every office
INSERT OR IGNORE INTO holidays(date, name, location_id, created_at) SELECT j.value, '', NULL, strftime('%Y-%m-%dT%H:%M:%SZ', 'now') FROM settings s, json_each(s.value) j WHERE s.key = 'holidays' AND j.type = 'text';
DELETE FROM settings WHERE key = 'holidays';
UPDATE settings SET value = '"KAOSnt"' WHERE key = 'app_name' AND value = '"Centro de trabajo"';
