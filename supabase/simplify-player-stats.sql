-- ============================================
-- Simplify Player Statistics Migration
-- ============================================
-- Remove detailed out statistics (strikeouts, groundouts, flyouts)
-- to simplify player input and focus on hitting results

-- Make out detail columns nullable (safer approach)
-- This preserves existing data while making fields optional
ALTER TABLE players
  ALTER COLUMN strikeouts DROP NOT NULL,
  ALTER COLUMN groundouts DROP NOT NULL,
  ALTER COLUMN flyouts DROP NOT NULL;

-- Set default values to 0 for new records
ALTER TABLE players
  ALTER COLUMN strikeouts SET DEFAULT 0,
  ALTER COLUMN groundouts SET DEFAULT 0,
  ALTER COLUMN flyouts SET DEFAULT 0;

-- Optional: Clear existing out detail data if desired
-- UPDATE players
-- SET
--   strikeouts = 0,
--   groundouts = 0,
--   flyouts = 0;

-- Add comment explaining the change
COMMENT ON COLUMN players.strikeouts IS 'Deprecated: No longer used in simulation logic';
COMMENT ON COLUMN players.groundouts IS 'Deprecated: No longer used in simulation logic';
COMMENT ON COLUMN players.flyouts IS 'Deprecated: No longer used in simulation logic';
