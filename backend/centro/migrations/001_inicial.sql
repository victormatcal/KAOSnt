-- Centro de trabajo · esquema inicial (versión 1)
-- Fechas-hora: texto ISO 8601 en UTC con sufijo Z. Fechas de calendario: 'YYYY-MM-DD' (fecha local).

CREATE TABLE clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE people (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT '',
  is_me INTEGER NOT NULL DEFAULT 0,
  weekly_capacity_hours REAL,              -- NULL = no informado
  active INTEGER NOT NULL DEFAULT 1,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'implementacion',
  client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'activo' CHECK (status IN ('activo','pausado','cerrado','archivado')),
  health TEXT CHECK (health IS NULL OR health IN ('normal','atencion','bloqueado')),
  health_note TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  summary_updated_at TEXT,
  next_action TEXT NOT NULL DEFAULT '',
  objective TEXT NOT NULL DEFAULT '',
  phase TEXT NOT NULL DEFAULT '',
  links TEXT NOT NULL DEFAULT '[]',        -- JSON [{label,url}]
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE project_people (
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (project_id, person_id)
);

-- Agrupaciones de un proyecto: línea de trabajo (principal), fase y entregable (opcionales)
CREATE TABLE groupings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('linea','fase','entregable')),
  name TEXT NOT NULL,
  position REAL NOT NULL DEFAULT 0
);

-- Hitos: hito, decisión pendiente o compromiso. Una sola entidad.
CREATE TABLE milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'hito' CHECK (kind IN ('hito','decision','compromiso')),
  title TEXT NOT NULL,
  date TEXT,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','cumplido','cancelado')),
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE recurrences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  assignee_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  priority TEXT NOT NULL DEFAULT 'normal',
  estimate_hours REAL,
  rule TEXT NOT NULL CHECK (rule IN ('diaria','laborables','semanal','cada_n_dias')),
  interval_days INTEGER,                   -- para cada_n_dias
  weekdays TEXT NOT NULL DEFAULT '[]',     -- JSON ISO 1..7 para semanal
  start_date TEXT NOT NULL,
  end_date TEXT,
  non_working TEXT NOT NULL DEFAULT 'saltar' CHECK (non_working IN ('saltar','siguiente_laborable','mantener')),
  active INTEGER NOT NULL DEFAULT 1,
  generated_until TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'tarea' CHECK (kind IN ('tarea','peticion','incidencia','mejora','evolutivo')),
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  workstream_id INTEGER REFERENCES groupings(id) ON DELETE SET NULL,
  phase_id INTEGER REFERENCES groupings(id) ON DELETE SET NULL,
  deliverable_id INTEGER REFERENCES groupings(id) ON DELETE SET NULL,
  parent_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
  assignee_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  reviewer_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (status IN ('backlog','pendiente','en_curso','en_revision','hecha','cancelada')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgente','alta','normal','baja')),
  position REAL NOT NULL DEFAULT 0,
  due_date TEXT,
  planned_date TEXT,
  started_at TEXT,
  completed_at TEXT,
  estimate_hours REAL,                     -- NULL = no informado
  approval TEXT NOT NULL DEFAULT 'no_requerida'
    CHECK (approval IN ('no_requerida','pendiente','aprobada','rechazada')),
  -- Condición adicional (independiente de la fase/estado)
  condition TEXT CHECK (condition IS NULL OR condition IN ('espera','bloqueada')),
  wait_reason TEXT NOT NULL DEFAULT '',
  wait_on TEXT NOT NULL DEFAULT '',        -- tercero en texto libre
  wait_on_person_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
  wait_since TEXT,
  wait_next_action TEXT NOT NULL DEFAULT '',
  follow_up_at TEXT,                       -- fecha-hora concreta de seguimiento
  follow_up_every_days INTEGER,            -- cada X días mientras siga la espera
  last_follow_up_at TEXT,
  -- Revisiones
  next_review_at TEXT,
  review_after_start_hours REAL,
  review_after_idle_hours REAL,
  review_hours_mode TEXT NOT NULL DEFAULT 'natural' CHECK (review_hours_mode IN ('natural','laborable')),
  last_significant_update TEXT NOT NULL,
  links TEXT NOT NULL DEFAULT '[]',
  recurrence_id INTEGER REFERENCES recurrences(id) ON DELETE SET NULL,
  occurrence_date TEXT,
  archived INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX ux_tasks_occurrence ON tasks(recurrence_id, occurrence_date) WHERE recurrence_id IS NOT NULL;
CREATE INDEX ix_tasks_project ON tasks(project_id);
CREATE INDEX ix_tasks_assignee ON tasks(assignee_id);
CREATE INDEX ix_tasks_status ON tasks(status);

CREATE TABLE task_dependencies (
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,        -- tarea bloqueada
  depends_on_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,  -- tarea que bloquea
  PRIMARY KEY (task_id, depends_on_id),
  CHECK (task_id <> depends_on_id)
);

CREATE TABLE task_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  at TEXT NOT NULL,
  kind TEXT NOT NULL,                      -- cambio | actualizacion | seguimiento
  text TEXT NOT NULL
);
CREATE INDEX ix_history_task ON task_history(task_id);

-- Reparto semanal explícito del esfuerzo
CREATE TABLE task_allocations (
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  week_start TEXT NOT NULL,                -- lunes 'YYYY-MM-DD'
  hours REAL NOT NULL CHECK (hours >= 0),
  PRIMARY KEY (task_id, week_start)
);

CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title_manual TEXT,                       -- NULL = usar título sugerido
  content TEXT NOT NULL DEFAULT '',
  kind TEXT CHECK (kind IS NULL OR kind IN ('acta','decision','documentacion')),
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  pinned INTEGER NOT NULL DEFAULT 0,
  state TEXT NOT NULL DEFAULT 'activa' CHECK (state IN ('activa','archivada','papelera')),
  version INTEGER NOT NULL DEFAULT 1,
  trashed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE note_task_links (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  excerpt TEXT,                            -- fragmento origen cuando se convierte texto en tarea
  created_at TEXT NOT NULL,
  PRIMARY KEY (note_id, task_id)
);

CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE
);
CREATE TABLE task_tags (
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, tag_id)
);
CREATE TABLE note_tags (
  note_id INTEGER NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);

CREATE TABLE absences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',          -- opcional; nunca se pide motivo
  created_at TEXT NOT NULL,
  CHECK (end_date >= start_date)
);

CREATE TABLE reminders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  dedup_key TEXT NOT NULL UNIQUE,
  rule TEXT NOT NULL,                      -- vence | revision | inicio | seguimiento | inactividad | manual
  task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','pospuesto','descartado','atendido')),
  snoozed_until TEXT,
  notified INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  resolved_at TEXT
);

CREATE TABLE saved_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  view TEXT NOT NULL,
  filters TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL                      -- JSON
);
