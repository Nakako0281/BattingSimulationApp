/**
 * Simulation types for batting simulation
 */

import type { Player, Team } from "./database";

// ============================================
// Simulation Result Types
// ============================================

export type OutcomeType =
  | "single"
  | "double"
  | "triple"
  | "home_run"
  | "walk"
  | "strikeout"
  | "groundout"
  | "flyout";

export interface AtBatResult {
  playerId: string;
  playerName: string;
  battingOrder: number;
  outcome: OutcomeType;
  rbi: number; // Runs batted in
  timestamp: Date;
}

export interface InningResult {
  inningNumber: number;
  atBats: AtBatResult[];
  runs: number;
  hits: number;
  errors: number;
  leftOnBase: number;
}

export interface GameResult {
  teamId: string;
  teamName: string;
  innings: InningResult[];
  totalRuns: number;
  totalHits: number;
  totalErrors: number;
  playerStats: PlayerGameStats[];
}

export interface PlayerGameStats {
  playerId: string;
  playerName: string;
  battingOrder: number;
  atBats: number;
  hits: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  battingAverage: number;
}

// ============================================
// Simulation Configuration Types
// ============================================

export interface SimulationConfig {
  teamId: string;
  numberOfGames: number;
  innings: number;
}

export interface SeasonSimulationConfig {
  teamId: string;
  numberOfGames: number;
  innings: number;
}

export interface SeasonResult {
  teamId: string;
  teamName: string;
  games: GameResult[];
  seasonStats: SeasonStats;
}

export interface SeasonStats {
  totalGames: number;
  totalRuns: number;
  totalHits: number;
  totalAtBats: number;
  averageRunsPerGame: number;
  averageBattingAverage: number;
  playerSeasonStats: PlayerSeasonStats[];
}

export interface PlayerSeasonStats {
  playerId: string;
  playerName: string;
  games: number;
  atBats: number;
  hits: number;
  singles: number;
  doubles: number;
  triples: number;
  homeRuns: number;
  runs: number;
  rbi: number;
  walks: number;
  strikeouts: number;
  battingAverage: number;
  onBasePercentage: number;
  sluggingPercentage: number;
  ops: number;
}

// ============================================
// Probability Calculation Types
// ============================================

export interface PlayerProbabilities {
  playerId: string;
  single: number;
  double: number;
  triple: number;
  homeRun: number;
  walk: number;
  strikeout: number;
  groundout: number;
  flyout: number;
}

export interface TeamProbabilities {
  teamId: string;
  players: PlayerProbabilities[];
}

// ============================================
// Simulation State Types
// ============================================

export interface BaseState {
  first: boolean;
  second: boolean;
  third: boolean;
}

export interface InningState {
  inningNumber: number;
  outs: number;
  bases: BaseState;
  runs: number;
  currentBatter: number; // batting order position (1-9)
}

export interface SimulationState {
  config: SimulationConfig;
  currentGame: number;
  inningState: InningState;
  gameResults: GameResult[];
  isComplete: boolean;
}
