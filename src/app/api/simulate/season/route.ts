import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTeamWithPlayers } from "@/lib/supabase/teams";
import { simulateSeason } from "@/lib/simulation/season";
import { z } from "zod";

const simulateSeasonSchema = z.object({
  teamId: z.string().uuid(),
  numberOfGames: z.number().int().min(1).max(162).default(10),
  innings: z.number().int().min(1).max(15).default(9),
});

/**
 * POST /api/simulate/season
 * Run a season simulation (multiple games)
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
    const { teamId, numberOfGames, innings } = simulateSeasonSchema.parse(body);

    // Get team with players
    const { data: team, error } = await getTeamWithPlayers(teamId, session.user.id);

    if (error || !team) {
      return NextResponse.json(
        { success: false, error: error || "Team not found" },
        { status: 404 }
      );
    }

    // Check if team has players
    if (team.players.length === 0) {
      return NextResponse.json(
        { success: false, error: "Team has no players" },
        { status: 400 }
      );
    }

    // Run season simulation
    const result = simulateSeason(
      team.id,
      team.name,
      team.players,
      numberOfGames,
      innings
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Season simulation API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
