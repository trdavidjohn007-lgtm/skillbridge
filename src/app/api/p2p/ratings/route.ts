import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { db } from "@/modules/core/db";
import { ratings, sessions, tutorProfiles } from "@/modules/p2p/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp, isValidUUID, sanitizeNumber, sanitizeStringArray, MAX_SIZES } from "@/lib/sanitize";

// POST /api/p2p/ratings - Submit a rating
export async function POST(request: Request) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.write);
  if (rl.limited) return rl.response;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { sessionId } = body;

    // Validate sessionId is UUID
    if (!sessionId || typeof sessionId !== "string" || !isValidUUID(sessionId)) {
      return NextResponse.json(
        { error: "Valid session ID required" },
        { status: 400 }
      );
    }

    // Validate stars
    const cleanStars = sanitizeNumber(stars, 1, 5, "stars");
    if (typeof cleanStars !== "number") {
      return NextResponse.json(
        { error: cleanStars.error },
        { status: 400 }
      );
    }

    // Validate tags
    const cleanTags = sanitizeStringArray(tags, 8, MAX_SIZES.tag);
    if (typeof cleanTags === "object" && "error" in cleanTags) {
      return NextResponse.json(
        { error: cleanTags.error },
        { status: 400 }
      );
    }

    // Verify session exists and user is participant
    const [sess] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .limit(1);

    if (!sess) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (sess.learnerId !== userId && sess.tutorId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Determine who is being rated
    const toUserId =
      sess.tutorId === userId ? sess.learnerId : sess.tutorId;

    // Check if already rated
    const [existing] = await db
      .select()
      .from(ratings)
      .where(
        and(eq(ratings.sessionId, sessionId), eq(ratings.fromUserId, userId))
      )
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Already rated this session" },
        { status: 400 }
      );
    }

    // Insert rating (use sanitized values)
    const [newRating] = await db
      .insert(ratings)
      .values({
        sessionId,
        fromUserId: userId,
        toUserId,
        stars: cleanStars,
        tags: Array.isArray(cleanTags) ? cleanTags : [],
      })
      .returning();

    // Update tutor's average rating if tutor was rated
    if (toUserId === sess.tutorId) {
      const avgResult = await db
        .select({
          avg: sql<number>`AVG(${ratings.stars})`,
          count: sql<number>`COUNT(*)`,
        })
        .from(ratings)
        .where(eq(ratings.toUserId, toUserId));

      if (avgResult[0]) {
        await db
          .update(tutorProfiles)
          .set({
            avgRating: String(avgResult[0].avg?.toFixed(2) || "0"),
            trustScore: String(
              (
                (avgResult[0].avg || 0) * 0.8 +
                (avgResult[0].count || 0) * 0.2
              ).toFixed(2)
            ),
          })
          .where(eq(tutorProfiles.userId, toUserId));
      }
    }

    return NextResponse.json(newRating, { status: 201 });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/p2p/ratings?userId=xxx - Get ratings for a user
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID required" },
        { status: 400 }
      );
    }

    const userRatings = await db
      .select()
      .from(ratings)
      .where(eq(ratings.toUserId, userId))
      .orderBy(desc(ratings.createdAt))
      .limit(20);

    const stats = await db
      .select({
        avg: sql<number>`AVG(${ratings.stars})`,
        count: sql<number>`COUNT(*)`,
      })
      .from(ratings)
      .where(eq(ratings.toUserId, userId));

    return NextResponse.json({
      ratings: userRatings,
      stats: stats[0],
    });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
