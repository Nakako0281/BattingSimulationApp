import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createPlayer } from "@/lib/supabase/players";
import { createPlayerSchema } from "@/lib/utils/validation";
import { z } from "zod";

/**
 * POST /api/players
 * Create a new player
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
    const validatedData = createPlayerSchema.parse(body);

    const { data, error } = await createPlayer(validatedData);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Create player API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
