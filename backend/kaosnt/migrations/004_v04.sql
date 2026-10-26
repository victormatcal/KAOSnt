-- KAOSnt 0.4 · English becomes the default interface language for NEW installations.
-- Additive migration: existing databases (they already have people) keep the Spanish interface they were using,
-- unless a language had already been chosen.
INSERT OR IGNORE INTO settings(key, value)
SELECT 'language', '"es"' WHERE EXISTS (SELECT 1 FROM people);
