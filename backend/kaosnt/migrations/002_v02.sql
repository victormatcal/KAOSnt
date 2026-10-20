-- KAOSnt 0.2 · oficinas y festivos por oficina, dedicación por proyecto, pasos de tarea,
-- edición de actualizaciones manuales. Migración aditiva: no elimina datos.

CREATE TABLE locations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  created_at TEXT NOT NULL
);

-- location_id NULL = festivo para todas las oficinas
CREATE TABLE holidays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  location_id INTEGER REFERENCES locations(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_holidays ON holidays(date, IFNULL(location_id, 0));

ALTER TABLE people ADD COLUMN location_id INTEGER REFERENCES locations(id) ON DELETE SET NULL;

-- Dedicación de una persona a un proyecto (% de su capacidad semanal). NULL = no informada
ALTER TABLE project_people ADD COLUMN dedication_pct REAL;

ALTER TABLE task_history ADD COLUMN edited_at TEXT;

-- Pasos: lista de comprobación ligera dentro de una tarea (no aparecen en tablero/lista/calendario)
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

-- Los festivos de la 0.1 (lista única en ajustes) pasan a ser festivos para todas las oficinas
INSERT OR IGNORE INTO holidays(date, name, location_id, created_at) SELECT j.value, '', NULL, strftime('%Y-%m-%dT%H:%M:%SZ', 'now') FROM settings s, json_each(s.value) j WHERE s.key = 'holidays' AND j.type = 'text';
DELETE FROM settings WHERE key = 'holidays';
UPDATE settings SET value = '"KAOSnt"' WHERE key = 'app_name' AND value = '"Centro de trabajo"';
