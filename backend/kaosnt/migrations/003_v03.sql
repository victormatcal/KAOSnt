-- KAOSnt 0.3 · full template for recurring series, «undo» log and working hours per day.
-- Additive migration: no data is deleted.

-- JSON template of the series (inherited fields, tags, steps, reminders and date offsets).
-- NULL = 0.2 series (only title, description, project, assignee, priority and estimate).
ALTER TABLE recurrences ADD COLUMN template TEXT;

-- Snapshots for «Undo» after direct actions. Ephemeral: not part of the export.
CREATE TABLE undo_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  payload TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0
);

-- Working hours per ISO day (1 = Monday … 7 = Sunday; null = non-working) from the 0.2 settings
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
