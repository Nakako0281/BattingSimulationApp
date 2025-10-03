/**
 * Supabase operations for simulation results
 */

import { createServerClient } from "./server";
import type { SimulationResult, SimulationResultWithTeams } from "@/types/database";
import type { GameResult, SeasonResult, MatchResult } from "@/types";

/**
 * Save a single game result
 */
export async function saveSingleGameResult(
  userId: string,
  teamId: string,
  gameResult: GameResult
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .insert({
      user_id: userId,
      team_id: teamId,
      simulation_type: "single_game",
      total_runs: gameResult.totalRuns,
      total_hits: gameResult.totalHits,
      total_errors: gameResult.totalErrors,
      innings_played: gameResult.innings.length,
      result_data: gameResult,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving game result:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SimulationResult, error: null };
}

/**
 * Save a season result
 */
export async function saveSeasonResult(
  userId: string,
  teamId: string,
  seasonResult: SeasonResult
) {
  const supabase = createServerClient();

  const wins = seasonResult.matches.filter((game: any) => game.finalScore.home >= 4).length;
  const losses = seasonResult.matches.length - wins;

  const { data, error } = await supabase
    .from("simulation_results")
    .insert({
      user_id: userId,
      team_id: teamId,
      simulation_type: "season",
      games_played: seasonResult.matches.length,
      wins: wins,
      losses: losses,
      result_data: seasonResult,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving season result:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SimulationResult, error: null };
}

/**
 * Get all simulation results for a user
 */
export async function getSimulationResults(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .select(`
      *,
      team:teams(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching simulation results:", error);
    return { data: null, error: error.message };
  }

  return { data: data as any[], error: null };
}

/**
 * Get a single simulation result by ID
 */
export async function getSimulationResult(id: string, userId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .select(`
      *,
      team:teams(*)
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching simulation result:", error);
    return { data: null, error: error.message };
  }

  return { data: data as any, error: null };
}

/**
 * Delete a simulation result
 */
export async function deleteSimulationResult(id: string, userId: string) {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("simulation_results")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting simulation result:", error);
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Get simulation results for a specific team
 */
export async function getTeamSimulationResults(
  userId: string,
  teamId: string,
  limit: number = 20
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .select(`
      *,
      team:teams(*)
    `)
    .eq("user_id", userId)
    .eq("team_id", teamId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching team simulation results:", error);
    return { data: null, error: error.message };
  }

  return { data: data as any[], error: null };
}

// ============================================
// V2: 2-Team Match System
// ============================================

/**
 * Save a single match result (V2)
 */
export async function saveMatchResult(
  userId: string,
  homeTeamId: string,
  awayTeamId: string,
  matchResult: MatchResult
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .insert({
      user_id: userId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      simulation_type: "single_game",
      home_runs: matchResult.finalScore.home,
      away_runs: matchResult.finalScore.away,
      home_hits: matchResult.homeTeam.totalHits,
      away_hits: matchResult.awayTeam.totalHits,
      winner: matchResult.winner,
      innings_played: matchResult.innings,
      result_data: matchResult,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving match result:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SimulationResult, error: null };
}

/**
 * Save a match season result (V2)
 */
export async function saveMatchSeasonResult(
  userId: string,
  homeTeamId: string,
  awayTeamId: string,
  seasonResult: SeasonResult
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .insert({
      user_id: userId,
      home_team_id: homeTeamId,
      away_team_id: awayTeamId,
      simulation_type: "season",
      games_played: seasonResult.seasonStats.totalGames,
      home_wins: seasonResult.seasonStats.homeWins,
      home_losses: seasonResult.seasonStats.totalGames - seasonResult.seasonStats.homeWins - seasonResult.seasonStats.ties,
      away_wins: seasonResult.seasonStats.awayWins,
      away_losses: seasonResult.seasonStats.totalGames - seasonResult.seasonStats.awayWins - seasonResult.seasonStats.ties,
      ties: seasonResult.seasonStats.ties,
      result_data: seasonResult,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving match season result:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SimulationResult, error: null };
}

/**
 * Get all simulation results for a user (V2)
 */
export async function getMatchSimulationResults(
  userId: string,
  limit: number = 50,
  offset: number = 0
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .select(`
      *,
      homeTeam:teams!simulation_results_home_team_id_fkey(*),
      awayTeam:teams!simulation_results_away_team_id_fkey(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching match simulation results:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SimulationResultWithTeams[], error: null };
}

/**
 * Get a single match simulation result by ID (V2)
 */
export async function getMatchSimulationResult(id: string, userId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("simulation_results")
    .select(`
      *,
      homeTeam:teams!simulation_results_home_team_id_fkey(*),
      awayTeam:teams!simulation_results_away_team_id_fkey(*)
    `)
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching match simulation result:", error);
    return { data: null, error: error.message };
  }

  return { data: data as SimulationResultWithTeams, error: null };
}
