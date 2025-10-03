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
  at_bats: number;

  // Deprecated fields (kept for backward compatibility)
  strikeouts?: number;
  groundouts?: number;
  flyouts?: number;

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
  at_bats?: number;
  // Deprecated - no longer used
  strikeouts?: number;
  groundouts?: number;
  flyouts?: number;
}

export interface UpdatePlayerInput {
  name?: string;
  batting_order?: number;
  singles?: number;
  doubles?: number;
  triples?: number;
  home_runs?: number;
  walks?: number;
  at_bats?: number;
  // Deprecated - no longer used
  strikeouts?: number;
  groundouts?: number;
  flyouts?: number;
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

// V2: 2-Team Match System
export interface SimulationResult {
  id: string;
  user_id: string;
  home_team_id: string;
  away_team_id: string;
  simulation_type: "single_game" | "season";

  // Single game results
  home_runs: number | null;
  away_runs: number | null;
  home_hits: number | null;
  away_hits: number | null;
  winner: "home" | "away" | "tie" | null;
  innings_played: number | null;

  // Season results
  games_played: number | null;
  home_wins: number | null;
  home_losses: number | null;
  away_wins: number | null;
  away_losses: number | null;
  ties: number | null;

  result_data: any; // JSONB - MatchResult or SeasonResult
  created_at: string;
}

export interface SimulationResultWithTeams extends SimulationResult {
  homeTeam: Team;
  awayTeam: Team;
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
