/**
 * Type definitions index
 * Central export point for all type definitions
 */

// Database types
export type {
  User,
  Team,
  Player,
  CreateTeamInput,
  UpdateTeamInput,
  CreatePlayerInput,
  UpdatePlayerInput,
  TeamWithPlayers,
  PlayerWithTeam,
  BattingStats,
  PlayerStats,
  ApiResponse,
  PaginatedResponse,
  SimulationResult,
  SimulationResultWithTeams,
} from "./database";

// Simulation types
export type {
  OutcomeType,
  AtBatResult,
  InningResult,
  GameResult,
  PlayerGameStats,
  SimulationConfig,
  SeasonSimulationConfig,
  SeasonResult,
  SeasonStats,
  PlayerSeasonStats,
  PlayerProbabilities,
  TeamProbabilities,
  BaseState,
  InningState,
  SimulationState,
  // V2 Types
  WinnerType,
  MatchResult,
  TeamSeasonStats,
} from "./simulation";
