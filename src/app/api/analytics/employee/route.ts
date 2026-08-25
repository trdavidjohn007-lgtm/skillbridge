import { NextRequest, NextResponse } from "next/server";
import { getEmployeeDashboardData } from "@/modules/analytics/employee-dashboard";
import { getAuthenticatedUser } from "@/modules/core/auth/middleware";
import { db } from "@/modules/core/db";
import { learnerProfiles } from "@/modules/core/db/schema";
import { eq } from "drizzle-orm";

// GET /api/analytics/employee - Get employee dashboard data
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

    const dashboardData = await getEmployeeDashboardData(profile.id);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Failed to fetch employee dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
