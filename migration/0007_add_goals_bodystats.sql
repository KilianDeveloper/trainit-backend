ALTER TABLE account ADD COLUMN goals JSON NOT NULL, ADD COLUMN body_fat JSON NOT NULL, ADD COLUMN body_weight JSON NOT NULL;
UPDATE account set goals="[]", body_fat="[]", body_weight="[]" WHERE true;