/**
 * Database types for Supabase tables
 * Generated from supabase/schema.sql
 */

// ============================================
// Core Database Types
// ============================================

export interface User {
  id: string;
  nickname: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  batting_order: number;

  // Batting Statistics
  singles: number;
  doubles: number;
  triples: number;
  home_runs: number;
  walks: number;
  strikeouts: number;
  groundouts: number;
  flyouts: number;
  at_bats: number;

  created_at: string;
  updated_at: string;
}

// ============================================
// Input Types (for creation/updates)
// ============================================

export interface CreateTeamInput {
  name: string;
}

export interface UpdateTeamInput {
  name?: string;
}

export interface CreatePlayerInput {
  team_id: string;
  name: string;
  batting_order: number;
  singles?: number;
  doubles?: number;
  triples?: number;
  home_runs?: number;
  walks?: number;
  strikeouts?: number;
  groundouts?: number;
  flyouts?: number;
  at_bats?: number;
}

export interface UpdatePlayerInput {
  name?: string;
  batting_order?: number;
  singles?: number;
  doubles?: number;
  triples?: number;
  home_runs?: number;
  walks?: number;
  strikeouts?: number;
  groundouts?: number;
  flyouts?: number;
  at_bats?: number;
}

// ============================================
// Response Types (with relations)
// ============================================

export interface TeamWithPlayers extends Team {
  players: Player[];
}

export interface PlayerWithTeam extends Player {
  team: Team;
}

export interface SimulationResult {
  id: string;
  user_id: string;
  team_id: string;
  simulation_type: "single_game" | "season";
  total_runs: number | null;
  total_hits: number | null;
  total_errors: number | null;
  innings_played: number | null;
  games_played: number | null;
  wins: number | null;
  losses: number | null;
  result_data: any; // JSONB - can be GameResult or SeasonResult
  created_at: string;
}

export interface SimulationResultWithTeam extends SimulationResult {
  team: Team;
}

// ============================================
// Calculated Statistics Types
// ============================================

export interface BattingStats {
  // Basic stats
  at_bats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  home_runs: number;
  walks: number;
  strikeouts: number;
  groundouts: number;
  flyouts: number;

  // Calculated stats
  batting_average: number; // hits / at_bats
  on_base_percentage: number; // (hits + walks) / (at_bats + walks)
  slugging_percentage: number; // total_bases / at_bats
  ops: number; // on_base_percentage + slugging_percentage
}

export interface PlayerStats extends Player {
  stats: BattingStats;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}
