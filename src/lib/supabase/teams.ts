/**
 * Team-related Supabase operations
 */

import { createServerClient } from "./server";
import type { Team, TeamWithPlayers, CreateTeamInput, UpdateTeamInput } from "@/types";

/**
 * Get all teams for the current user
 */
export async function getUserTeams(userId: string) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("teams")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching teams:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Team[], error: null };
}

/**
 * Get a single team with its players
 */
export async function getTeamWithPlayers(teamId: string, userId: string) {
  const supabase = createServerClient();

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .eq("user_id", userId)
    .single();

  if (teamError || !team) {
    console.error("Error fetching team:", teamError);
    return { data: null, error: teamError?.message || "Team not found" };
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId)
    .order("batting_order", { ascending: true });

  if (playersError) {
    console.error("Error fetching players:", playersError);
    return { data: null, error: playersError.message };
  }

  const teamWithPlayers: TeamWithPlayers = {
    ...team,
    players: players || [],
  };

  return { data: teamWithPlayers, error: null };
}

/**
 * Create a new team
 */
export async function createTeam(userId: string, input: CreateTeamInput) {
  const supabase = createServerClient();

  // Check team limit (max 4 teams per user)
  const { data: existingTeams, error: countError } = await supabase
    .from("teams")
    .select("id")
    .eq("user_id", userId);

  if (countError) {
    console.error("Error checking team count:", countError);
    return { data: null, error: countError.message };
  }

  if (existingTeams && existingTeams.length >= 4) {
    return { data: null, error: "Maximum team limit reached (4 teams)" };
  }

  const { data, error } = await supabase
    .from("teams")
    .insert({
      user_id: userId,
      name: input.name,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating team:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Team, error: null };
}

/**
 * Update a team
 */
export async function updateTeam(
  teamId: string,
  userId: string,
  input: UpdateTeamInput
) {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("teams")
    .update(input)
    .eq("id", teamId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating team:", error);
    return { data: null, error: error.message };
  }

  return { data: data as Team, error: null };
}

/**
 * Delete a team (cascade deletes players)
 */
export async function deleteTeam(teamId: string, userId: string) {
  const supabase = createServerClient();

  const { error } = await supabase
    .from("teams")
    .delete()
    .eq("id", teamId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting team:", error);
    return { error: error.message };
  }

  return { error: null };
}
