-- KAOSnt 0.3 · plantilla completa de series recurrentes, registro de «deshacer» y horario laboral por día.
-- Migración aditiva: no elimina datos.

-- Plantilla JSON de la serie (campos heredados, etiquetas, pasos, recordatorios y desplazamientos de fechas).
-- NULL = serie de la 0.2 (solo título, descripción, proyecto, responsable, prioridad y estimación).
ALTER TABLE recurrences ADD COLUMN template TEXT;

-- Instantáneas para «Deshacer» tras acciones directas. Efímero: no forma parte de la exportación.
CREATE TABLE undo_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

-- Horario laboral por día ISO (1 = lunes … 7 = domingo; null = no laborable) a partir de los ajustes de la 0.2
INSERT OR IGNORE INTO settings(key, value)
SELECT 'work_schedule', (
  SELECT json_group_object(CAST(d.n AS TEXT),
    CASE WHEN EXISTS (SELECT 1 FROM json_each(COALESCE((SELECT value FROM settings WHERE key = 'workdays'), '[1,2,3,4,5]')) j WHERE j.value = d.n)
      THEN json_object('start', COALESCE((SELECT json_extract(value, '$') FROM settings WHERE key = 'work_start'), '09:00'),
                       'end', COALESCE((SELECT json_extract(value, '$') FROM settings WHERE key = 'work_end'), '18:00'))
      ELSE json('null') END)
  FROM (SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7) d)
WHERE EXISTS (SELECT 1 FROM settings WHERE key IN ('workdays', 'work_start', 'work_end'));
DELETE FROM settings WHERE key IN ('workdays', 'work_start', 'work_end');
