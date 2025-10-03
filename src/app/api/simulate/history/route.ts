import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMatchSimulationResults } from "@/lib/supabase/simulation-results";

/**
 * GET /api/simulate/history
 * Get simulation result history
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

    const { data, error } = await getMatchSimulationResults(session.user.id);

    if (error) {
      return NextResponse.json(
        { success: false, error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Get simulation history API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
