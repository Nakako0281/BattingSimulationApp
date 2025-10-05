import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserTeams, createTeam } from "@/lib/supabase/teams";
import { createPlayer } from "@/lib/supabase/players";
import { createTeamSchema } from "@/lib/utils/validation";
import { createDefaultPlayers } from "@/lib/constants/defaultPlayers";
import { z } from "zod";

/**
 * GET /api/teams
 * Get all teams for the current user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await getUserTeams(session.user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Teams API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/teams
 * Create a new team
 */
export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validatedData = createTeamSchema.parse(body);

    const { data: team, error } = await createTeam(session.user.id, validatedData);

    if (error || !team) {
      return NextResponse.json(
        { success: false, error: error || "Failed to create team" },
        { status: 400 }
      );
    }

    // Auto-create default players (9 players with OPS ~0.750)
    const defaultPlayers = createDefaultPlayers(team.id);
    for (const playerData of defaultPlayers) {
      const { error: playerError } = await createPlayer({
        team_id: team.id,
        ...playerData,
      });

      if (playerError) {
        console.error(`Failed to create default player ${playerData.name}:`, playerError);
        // Continue creating other players even if one fails
      }
    }

    return NextResponse.json({ success: true, data: team }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Create team API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
