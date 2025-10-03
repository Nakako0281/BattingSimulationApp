import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTeamWithPlayers } from "@/lib/supabase/teams";
import { simulateMatchSeason } from "@/lib/simulation/season";
import { z } from "zod";

const simulateSeasonSchema = z.object({
  homeTeamId: z.string().uuid(),
  awayTeamId: z.string().uuid(),
  numberOfGames: z.number().int().min(1).max(162).default(10),
  innings: z.number().int().min(1).max(15).default(9),
});

/**
 * POST /api/simulate/season
 * Run a season simulation between two teams (multiple matches)
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
    const { homeTeamId, awayTeamId, numberOfGames, innings } = simulateSeasonSchema.parse(body);

    // Validate teams are different
    if (homeTeamId === awayTeamId) {
      return NextResponse.json(
        { success: false, error: "Home and away teams must be different" },
        { status: 400 }
      );
    }

    // Get home team with players
    const { data: homeTeam, error: homeError } = await getTeamWithPlayers(
      homeTeamId,
      session.user.id
    );

    if (homeError || !homeTeam) {
      return NextResponse.json(
        { success: false, error: homeError || "Home team not found" },
        { status: 404 }
      );
    }

    // Get away team with players
    const { data: awayTeam, error: awayError } = await getTeamWithPlayers(
      awayTeamId,
      session.user.id
    );

    if (awayError || !awayTeam) {
      return NextResponse.json(
        { success: false, error: awayError || "Away team not found" },
        { status: 404 }
      );
    }

    // Check if teams have players
    if (homeTeam.players.length === 0) {
      return NextResponse.json(
        { success: false, error: "Home team has no players" },
        { status: 400 }
      );
    }

    if (awayTeam.players.length === 0) {
      return NextResponse.json(
        { success: false, error: "Away team has no players" },
        { status: 400 }
      );
    }

    // Run season simulation
    const result = simulateMatchSeason(
      homeTeam,
      homeTeam.players,
      awayTeam,
      awayTeam.players,
      numberOfGames,
      innings
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.issues },
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
