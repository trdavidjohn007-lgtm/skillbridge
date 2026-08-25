import { NextRequest, NextResponse } from "next/server";
import { getCachedCourses, getCachedTpacProgrammes } from "@/modules/integration/igot-client";
import { requireAuth } from "@/modules/core/auth/middleware";

// GET /api/courses - Browse course catalog
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain") || undefined;
    const difficulty = searchParams.get("difficulty") || undefined;
    const source = searchParams.get("source") || undefined; // 'igot' or 'tpac'

    let courses: any[] = [];

    if (!source || source === "igot") {
      const igotCourses = await getCachedCourses({ domain, difficulty });
      courses.push(
        ...igotCourses.map((c) => ({
          ...c,
          source: "igot",
        }))
      );
    }

    if (!source || source === "tpac") {
      const tpacCourses = await getCachedTpacProgrammes();
      courses.push(
        ...tpacCourses.map((c) => ({
          ...c,
          source: "tpac",
          igotCourseId: c.programmeId,
          title: c.title,
          domain: "Statistical Methods",
          durationHours: (c.durationDays || 1) * 8,
          difficulty: "Advanced",
        }))
      );
    }

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}
