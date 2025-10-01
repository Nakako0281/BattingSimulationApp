/**
 * Player-related Supabase operations
 */

import { createServerClient } from "./server";
import type { Player, CreatePlayerInput, UpdatePlayerInput } from "@/types";

/**
 * Get all players for a team
 */
export async function getTeamPlayers(teamId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("batting_order", { ascending: true });

  if (error) {
    console.error("Error fetching players:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Player[], error: null };
}

/**
 * Get a single player
 */
export async function getPlayer(playerId: string, teamId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("id", playerId)
    .eq("team_id", teamId)
    .single();

  if (error) {
    console.error("Error fetching player:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Player, error: null };
}

/**
 * Create a new player
 */
export async function createPlayer(input: CreatePlayerInput) {
  const supabase = createServerClient();

  // Check player limit (max 9 players per team)
  const { data: existingPlayers, error: countError } = await supabase
    .from("players")
    .select("id")
    .eq("team_id", input.team_id);

  if (countError) {
    console.error("Error checking player count:", countError);
    return { data: null, error: countError.message };
  }

  if (existingPlayers && existingPlayers.length >= 9) {
    return { data: null, error: "Maximum player limit reached (9 players)" };
  }

  // Check if batting order is already taken
  const { data: existingOrder, error: orderError } = await supabase
    .from("players")
    .select("id")
    .eq("team_id", input.team_id)
    .eq("batting_order", input.batting_order)
    .single();

  if (existingOrder) {
    return { data: null, error: `Batting order ${input.batting_order} is already taken` };
  }

  const { data, error } = await supabase
    .from("players")
    .insert(input)
    .select()
    .single();

  if (error) {
    console.error("Error creating player:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Player, error: null };
}

/**
 * Update a player
 */
export async function updatePlayer(
  playerId: string,
  teamId: string,
  input: UpdatePlayerInput
) {
  const supabase = createServerClient();

  // If batting order is being changed, check if it's available
  if (input.batting_order !== undefined) {
    const { data: existingOrder, error: orderError } = await supabase
      .from("players")
      .select("id")
      .eq("team_id", teamId)
      .eq("batting_order", input.batting_order)
      .neq("id", playerId)
      .single();

    if (existingOrder) {
      return { data: null, error: `Batting order ${input.batting_order} is already taken` };
    }
  }

  const { data, error } = await supabase
    .from("players")
    .update(input)
    .eq("id", playerId)
    .eq("team_id", teamId)
    .select()
    .single();

  if (error) {
    console.error("Error updating player:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Player, error: null };
}

/**
 * Delete a player
 */
export async function deletePlayer(playerId: string, teamId: string) {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("players")
    .delete()
    .eq("id", playerId)
    .eq("team_id", teamId);

  if (error) {
    console.error("Error deleting player:", error);
    return { error: error.message };
  }

  return { error: null };
}
