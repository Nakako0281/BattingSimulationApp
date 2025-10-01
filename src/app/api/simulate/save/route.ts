import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { saveSingleGameResult, saveSeasonResult } from "@/lib/supabase/simulation-results";
import { z } from "zod";

const saveGameSchema = z.object({
  type: z.literal("single_game"),
  teamId: z.string().uuid(),
  result: z.any(), // GameResult type
});

const saveSeasonSchema = z.object({
  type: z.literal("season"),
  teamId: z.string().uuid(),
  result: z.any(), // SeasonResult type
});

const saveSchema = z.discriminatedUnion("type", [saveGameSchema, saveSeasonSchema]);

/**
 * POST /api/simulate/save
 * Save simulation results
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
    const validated = saveSchema.parse(body);

    let result;

    if (validated.type === "single_game") {
      result = await saveSingleGameResult(
        session.user.id,
        validated.teamId,
        validated.result
      );
    } else {
      result = await saveSeasonResult(
        session.user.id,
        validated.teamId,
        validated.result
      );
    }

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Save simulation result API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
