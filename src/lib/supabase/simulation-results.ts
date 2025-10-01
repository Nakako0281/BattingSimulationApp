/**
 * Supabase operations for simulation results
 */

import { createServerClient } from "./server";
import type { SimulationResult, SimulationResultWithTeam } from "@/types/database";
import type { GameResult, SeasonResult } from "@/types";

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

  const wins = seasonResult.games.filter(game => game.totalRuns >= 4).length;
  const losses = seasonResult.games.length - wins;

  const { data, error } = await supabase
    .from("simulation_results")
    .insert({
      user_id: userId,
      team_id: teamId,
      simulation_type: "season",
      games_played: seasonResult.games.length,
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

  return { data: data as SimulationResultWithTeam[], error: null };
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

  return { data: data as SimulationResultWithTeam, error: null };
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

  return { data: data as SimulationResultWithTeam[], error: null };
}
