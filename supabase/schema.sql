-- ============================================
-- Baseball Batting Simulation Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nickname VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT nickname_length CHECK (char_length(nickname) >= 3 AND char_length(nickname) <= 50)
);

-- Index for faster nickname lookups
CREATE INDEX IF NOT EXISTS idx_users_nickname ON users(nickname);

-- ============================================
-- TEAMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT team_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100)
);

-- Index for faster user_id lookups
CREATE INDEX IF NOT EXISTS idx_teams_user_id ON teams(user_id);

-- ============================================
-- PLAYERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  batting_order INTEGER NOT NULL,

  -- Batting Statistics
  singles INTEGER NOT NULL DEFAULT 0,
  doubles INTEGER NOT NULL DEFAULT 0,
  triples INTEGER NOT NULL DEFAULT 0,
  home_runs INTEGER NOT NULL DEFAULT 0,
  walks INTEGER NOT NULL DEFAULT 0,
  strikeouts INTEGER NOT NULL DEFAULT 0,
  groundouts INTEGER NOT NULL DEFAULT 0,
  flyouts INTEGER NOT NULL DEFAULT 0,
  at_bats INTEGER NOT NULL DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CONSTRAINT player_name_length CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  CONSTRAINT batting_order_range CHECK (batting_order >= 1 AND batting_order <= 9),
  CONSTRAINT valid_stats CHECK (
    singles >= 0 AND
    doubles >= 0 AND
    triples >= 0 AND
    home_runs >= 0 AND
    walks >= 0 AND
    strikeouts >= 0 AND
    groundouts >= 0 AND
    flyouts >= 0 AND
    at_bats >= 0
  ),
  CONSTRAINT unique_batting_order_per_team UNIQUE (team_id, batting_order)
);

-- Index for faster team_id lookups
CREATE INDEX IF NOT EXISTS idx_players_team_id ON players(team_id);

-- Index for batting order within a team
CREATE INDEX IF NOT EXISTS idx_players_batting_order ON players(team_id, batting_order);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- USERS: Users can only read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT
  USING (auth.uid() = id);

-- USERS: Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE
  USING (auth.uid() = id);

-- TEAMS: Users can select their own teams
CREATE POLICY teams_select_own ON teams
  FOR SELECT
  USING (auth.uid() = user_id);

-- TEAMS: Users can insert their own teams (max 4 enforced in application)
CREATE POLICY teams_insert_own ON teams
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- TEAMS: Users can update their own teams
CREATE POLICY teams_update_own ON teams
  FOR UPDATE
  USING (auth.uid() = user_id);

-- TEAMS: Users can delete their own teams
CREATE POLICY teams_delete_own ON teams
  FOR DELETE
  USING (auth.uid() = user_id);

-- PLAYERS: Users can select players from their own teams
CREATE POLICY players_select_own ON players
  FOR SELECT
  USING (
    team_id IN (
      SELECT id FROM teams WHERE user_id = auth.uid()
    )
  );

-- PLAYERS: Users can insert players to their own teams
CREATE POLICY players_insert_own ON players
  FOR INSERT
  WITH CHECK (
    team_id IN (
      SELECT id FROM teams WHERE user_id = auth.uid()
    )
  );

-- PLAYERS: Users can update players on their own teams
CREATE POLICY players_update_own ON players
  FOR UPDATE
  USING (
    team_id IN (
      SELECT id FROM teams WHERE user_id = auth.uid()
    )
  );

-- PLAYERS: Users can delete players from their own teams
CREATE POLICY players_delete_own ON players
  FOR DELETE
  USING (
    team_id IN (
      SELECT id FROM teams WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for teams table
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for players table
CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Note: This is commented out. Uncomment to insert sample data
/*
-- Sample user (password: 'password123' hashed with bcrypt)
INSERT INTO users (id, nickname, password_hash) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'testuser', '$2b$10$abcdefghijklmnopqrstuvwxyz123456789');

-- Sample team
INSERT INTO teams (id, user_id, name) VALUES
('650e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440000', 'Test Team');

-- Sample players
INSERT INTO players (team_id, name, batting_order, singles, doubles, triples, home_runs, walks, strikeouts, groundouts, flyouts, at_bats) VALUES
('650e8400-e29b-41d4-a716-446655440000', '選手1', 1, 80, 20, 5, 10, 50, 60, 100, 80, 400),
('650e8400-e29b-41d4-a716-446655440000', '選手2', 2, 90, 25, 3, 15, 45, 70, 90, 75, 420),
('650e8400-e29b-41d4-a716-446655440000', '選手3', 3, 100, 30, 4, 20, 55, 65, 85, 70, 450),
('650e8400-e29b-41d4-a716-446655440000', '選手4', 4, 85, 22, 2, 12, 48, 68, 95, 78, 410),
('650e8400-e29b-41d4-a716-446655440000', '選手5', 5, 75, 18, 3, 8, 42, 72, 105, 82, 390),
('650e8400-e29b-41d4-a716-446655440000', '選手6', 6, 70, 15, 2, 6, 40, 75, 110, 85, 380),
('650e8400-e29b-41d4-a716-446655440000', '選手7', 7, 65, 12, 1, 5, 38, 78, 115, 88, 370),
('650e8400-e29b-41d4-a716-446655440000', '選手8', 8, 60, 10, 1, 4, 35, 80, 120, 90, 360),
('650e8400-e29b-41d4-a716-446655440000', '選手9', 9, 55, 8, 0, 3, 32, 82, 125, 92, 350);
*/
