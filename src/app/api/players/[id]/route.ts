import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPlayer, updatePlayer, deletePlayer } from "@/lib/supabase/players";
import { updatePlayerSchema } from "@/lib/utils/validation";
import { z } from "zod";

/**
 * GET /api/players/[id]
 * Get a single player
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get team_id from query params
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "team_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await getPlayer(id, teamId);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get player API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/players/[id]
 * Update a player
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { team_id, ...updateData } = body;

    if (!team_id) {
      return NextResponse.json(
        { success: false, error: "team_id is required" },
        { status: 400 }
      );
    }

    // Validate input
    const validatedData = updatePlayerSchema.parse(updateData);

    const { data, error } = await updatePlayer(id, team_id, validatedData);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Update player API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/players/[id]
 * Delete a player
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get team_id from query params
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get("team_id");

    if (!teamId) {
      return NextResponse.json(
        { success: false, error: "team_id is required" },
        { status: 400 }
      );
    }

    const { error } = await deletePlayer(id, teamId);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete player API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
