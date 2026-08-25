import { NextRequest, NextResponse } from "next/server";
import { syncIgotCourses, syncTpacProgrammes } from "@/modules/integration/igot-client";
import { requireRoles } from "@/modules/core/auth/middleware";

// POST /api/courses/sync - Trigger course synchronization
export async function POST(request: NextRequest) {
  const auth = await requireRoles(request, ["super_admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { source = "both", type = "incremental" } = body;

    const results: any[] = [];

    if (source === "igot" || source === "both") {
      const igotResult = await syncIgotCourses(type);
      results.push(igotResult);
    }

    if (source === "tpac" || source === "both") {
      const tpacResult = await syncTpacProgrammes();
      results.push(tpacResult);
    }

    return NextResponse.json({
      message: "Sync completed",
      results,
    });
  } catch (error) {
    console.error("Failed to sync courses:", error);
    return NextResponse.json(
      { error: "Failed to sync courses" },
      { status: 500 }
    );
  }
}
