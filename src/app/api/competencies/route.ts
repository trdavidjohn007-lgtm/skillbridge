import { NextRequest, NextResponse } from "next/server";
import { db } from "@/modules/core/db";
import { competencies } from "@/modules/core/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "@/modules/core/auth/middleware";

// GET /api/competencies - List all competencies
export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");
    const level = searchParams.get("level");

    let query = db.select().from(competencies);

    // Apply filters
    if (domain) {
      query = query.where(eq(competencies.domain, domain as any));
    }

    const results = await query;

    return NextResponse.json({ competencies: results });
  } catch (error) {
    console.error("Failed to fetch competencies:", error);
    return NextResponse.json(
      { error: "Failed to fetch competencies" },
      { status: 500 }
    );
  }
}

// POST /api/competencies - Create a new competency
export async function POST(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();
    const { name, description, domain, level, frameworkVersion } = body;

    if (!name || !domain || !level) {
      return NextResponse.json(
        { error: "Missing required fields: name, domain, level" },
        { status: 400 }
      );
    }

    const [competency] = await db
      .insert(competencies)
      .values({
        name,
        description,
        domain,
        level,
        frameworkVersion: frameworkVersion || "1.0.0",
      })
      .returning();

    return NextResponse.json({ competency }, { status: 201 });
  } catch (error) {
    console.error("Failed to create competency:", error);
    return NextResponse.json(
      { error: "Failed to create competency" },
      { status: 500 }
    );
  }
}
