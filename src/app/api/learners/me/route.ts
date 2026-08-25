import { NextRequest, NextResponse } from "next/server";
import { db } from "@/modules/core/db";
import { learnerProfiles, users } from "@/modules/core/db/schema";
import { eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/modules/core/auth/middleware";

// GET /api/learners/me - Get current user's profile
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
      // Create profile if it doesn't exist
      const [newProfile] = await db
        .insert(learnerProfiles)
        .values({
          userId: user.id,
          employeeId: `EMP-${Date.now()}`,
          designation: "Statistical Officer",
          department: "National Statistical Office",
          jobRole: "Data Analyst",
        })
        .returning();

      return NextResponse.json({ profile: newProfile });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/learners/me - Update current user's profile
export async function PUT(request: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { designation, department, jobRole, education, workExperienceYears, preferredLanguage } =
      body;

    const [updated] = await db
      .update(learnerProfiles)
      .set({
        ...(designation && { designation }),
        ...(department && { department }),
        ...(jobRole && { jobRole }),
        ...(education && { education }),
        ...(workExperienceYears !== undefined && { workExperienceYears }),
        ...(preferredLanguage && { preferredLanguage }),
        updatedAt: new Date(),
      })
      .where(eq(learnerProfiles.userId, user.id))
      .returning();

    return NextResponse.json({ profile: updated });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
