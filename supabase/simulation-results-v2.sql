-- ============================================
-- Simulation Results Table V2 - 2-Team Match System
-- ============================================
-- BREAKING CHANGE: This replaces the old single-team simulation system

-- Drop old table and recreate for 2-team match system
DROP TABLE IF EXISTS simulation_results;

-- Create new simulation_results table for 2-team matches
CREATE TABLE simulation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Match information
  home_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  simulation_type VARCHAR(20) NOT NULL CHECK (simulation_type IN ('single_game', 'season')),

  -- Single game results
  home_runs INTEGER,
  away_runs INTEGER,
  home_hits INTEGER,
  away_hits INTEGER,
  winner VARCHAR(10) CHECK (winner IN ('home', 'away', 'tie')),
  innings_played INTEGER,

  -- Season results (for season simulations)
  games_played INTEGER,
  home_wins INTEGER,
  home_losses INTEGER,
  away_wins INTEGER,
  away_losses INTEGER,
  ties INTEGER,

  -- Full result data (JSONB for flexibility)
  result_data JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure both teams belong to the same user
  CONSTRAINT same_user_teams CHECK (
    home_team_id IN (SELECT id FROM teams WHERE user_id = simulation_results.user_id) AND
    away_team_id IN (SELECT id FROM teams WHERE user_id = simulation_results.user_id)
  ),

  -- Ensure different teams
  CONSTRAINT different_teams CHECK (home_team_id != away_team_id)
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_simulation_results_user_id ON simulation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_home_team ON simulation_results(home_team_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_away_team ON simulation_results(away_team_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_created_at ON simulation_results(created_at DESC);

-- Enable RLS
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS simulation_results_select_all ON simulation_results;
DROP POLICY IF EXISTS simulation_results_insert_all ON simulation_results;
DROP POLICY IF EXISTS simulation_results_delete_all ON simulation_results;

CREATE POLICY simulation_results_select_all ON simulation_results
  FOR SELECT
  USING (true);

CREATE POLICY simulation_results_insert_all ON simulation_results
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY simulation_results_delete_all ON simulation_results
  FOR DELETE
  USING (true);

-- ============================================
-- NOTES
-- ============================================
-- This schema supports:
-- 1. 2-team matches (home vs away)
-- 2. Winner determination (home/away/tie)
-- 3. Separate statistics for each team
-- 4. Season simulations with win/loss records
-- 5. User isolation (both teams must belong to same user)
