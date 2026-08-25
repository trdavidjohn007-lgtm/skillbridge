import { NextRequest, NextResponse } from "next/server";
import { getAdminDashboardData } from "@/modules/analytics/admin-dashboard";
import { requireRoles } from "@/modules/core/auth/middleware";

// GET /api/analytics/admin - Get admin dashboard data
export async function GET(request: NextRequest) {
  const auth = await requireRoles(request, ["super_admin", "dept_admin"]);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get("department") || undefined;

    const dashboardData = await getAdminDashboardData(department);

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Failed to fetch admin dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch admin dashboard data" },
      { status: 500 }
    );
  }
}
