-- シミュレーション結果保存用テーブル
CREATE TABLE IF NOT EXISTS simulation_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  simulation_type VARCHAR(20) NOT NULL CHECK (simulation_type IN ('single_game', 'season')),

  -- Single game results
  total_runs INTEGER,
  total_hits INTEGER,
  total_errors INTEGER,
  innings_played INTEGER,

  -- Season results
  games_played INTEGER,
  wins INTEGER,
  losses INTEGER,

  -- Full result data (JSONB for flexibility)
  result_data JSONB NOT NULL,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT valid_simulation_type CHECK (
    (simulation_type = 'single_game' AND total_runs IS NOT NULL) OR
    (simulation_type = 'season' AND games_played IS NOT NULL)
  )
);

-- RLS policies
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

-- Users can only see their own simulation results
CREATE POLICY "Users can view their own simulation results"
  ON simulation_results
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create simulation results
CREATE POLICY "Users can create simulation results"
  ON simulation_results
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own simulation results
CREATE POLICY "Users can delete their own simulation results"
  ON simulation_results
  FOR DELETE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_simulation_results_user_id ON simulation_results(user_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_team_id ON simulation_results(team_id);
CREATE INDEX IF NOT EXISTS idx_simulation_results_created_at ON simulation_results(created_at DESC);
