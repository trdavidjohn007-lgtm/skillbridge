import { NextRequest, NextResponse } from "next/server";
import { getLearnerPaths, generateLearningPath } from "@/modules/learning/path";
import { analyzeSkillGaps } from "@/modules/competency/gaps";
import { getAuthenticatedUser } from "@/modules/core/auth/middleware";
import { db } from "@/modules/core/db";
import { learnerProfiles } from "@/modules/core/db/schema";
import { eq } from "drizzle-orm";

// GET /api/learning-paths - Get learner's active learning paths
export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    const paths = await getLearnerPaths(profile.id);

    return NextResponse.json({ paths });
  } catch (error) {
    console.error("Failed to fetch learning paths:", error);
    return NextResponse.json(
      { error: "Failed to fetch learning paths" },
      { status: 500 }
    );
  }
}

// POST /api/learning-paths/generate - Generate a new learning path
export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
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

    // First analyze skill gaps
    const gapAnalysis = await analyzeSkillGaps(profile.id);

    if (gapAnalysis.gaps.length === 0) {
      return NextResponse.json({
        message: "No skill gaps identified. Your competencies meet all requirements.",
        path: null,
      });
    }

    // Generate learning path based on gaps
    const path = await generateLearningPath(profile.id, gapAnalysis.gaps);

    return NextResponse.json({ path }, { status: 201 });
  } catch (error) {
    console.error("Failed to generate learning path:", error);
    return NextResponse.json(
      { error: "Failed to generate learning path" },
      { status: 500 }
    );
  }
}
