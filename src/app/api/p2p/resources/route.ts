import { NextResponse } from "next/server";
import { db } from "@/modules/core/db";
import { resources, userBookmarks } from "@/modules/p2p/schema";
import { eq, and, getTableColumns } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp, sanitizeText } from "@/lib/sanitize";

// GET /api/p2p/resources - List resources with optional filters
export async function GET(request: Request) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") ? sanitizeText(searchParams.get("topic")!) : null;
    const type = searchParams.get("type") ? sanitizeText(searchParams.get("type")!) : null;
    const difficulty = searchParams.get("difficulty") ? sanitizeText(searchParams.get("difficulty")!) : null;

    // Validate filter values
    const validTypes = ["video", "course", "practice", "docs", "interactive"];
    const validDifficulties = ["beginner", "intermediate", "advanced"];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid type filter" }, { status: 400 });
    }
    if (difficulty && !validDifficulties.includes(difficulty)) {
      return NextResponse.json({ error: "Invalid difficulty filter" }, { status: 400 });
    }

    let query = db.select().from(resources);

    const conditions = [];
    if (topic) conditions.push(eq(resources.topic, topic));
    if (type) conditions.push(eq(resources.type, type as any));
    if (difficulty)
      conditions.push(eq(resources.difficulty, difficulty as any));

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;

    // Get unique topics for filter
    const allTopics = [...new Set(results.map((r) => r.topic))];

    return NextResponse.json({
      resources: results,
      topics: allTopics,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
