-- ============================================
-- Simplify Player Statistics Migration
-- ============================================
-- Remove detailed out statistics (strikeouts, groundouts, flyouts)
-- to simplify player input and focus on hitting results

-- Drop the deprecated columns completely
-- Safe to do as only test data exists (no production users yet)
ALTER TABLE players
  DROP COLUMN IF EXISTS strikeouts,
  DROP COLUMN IF EXISTS groundouts,
  DROP COLUMN IF EXISTS flyouts;

-- Note: This migration completely removes the out detail columns
-- The simulation now uses a single "out" outcome type
-- Outs are calculated as: at_bats - (singles + doubles + triples + home_runs)
