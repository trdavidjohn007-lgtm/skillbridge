import { NextRequest, NextResponse } from "next/server";
import { analyzeSkillGaps } from "@/modules/competency/gaps";
import { getAuthenticatedUser } from "@/modules/core/auth/middleware";

// GET /api/learners/me/skill-gaps - Get skill gaps for current user
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get learner profile ID from user ID
    const { db } = await import("@/modules/core/db");
    const { learnerProfiles } = await import("@/modules/core/db/schema");
    const { eq } = await import("drizzle-orm");

    const [profile] = await db
      .select()
      .from(learnerProfiles)
      .where(eq(learnerProfiles.userId, user.id))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: "Learner profile not found" },
        { status: 404 }
      );
    }

    const gapAnalysis = await analyzeSkillGaps(profile.id);

    return NextResponse.json(gapAnalysis);
  } catch (error) {
    console.error("Failed to analyze skill gaps:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gaps" },
      { status: 500 }
    );
  }
}
