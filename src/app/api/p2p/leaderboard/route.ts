import { NextResponse } from "next/server";
import { db } from "@/modules/core/db";
import { tutorProfiles, p2pLearnerProfiles } from "@/modules/p2p/schema";
import { desc, sql } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/sanitize";

// GET /api/p2p/leaderboard - Get top tutors and learners
export async function GET(request: Request) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  try {
    // Top tutors by rating + sessions
    const topTutors = await db
      .select({
        userId: tutorProfiles.userId,
        anonymousName: tutorProfiles.anonymousName,
        avatarUrl: tutorProfiles.avatarUrl,
        subjects: tutorProfiles.subjects,
        totalHours: tutorProfiles.totalHours,
        totalSessions: tutorProfiles.totalSessions,
        avgRating: tutorProfiles.avgRating,
        trustScore: tutorProfiles.trustScore,
        verifiedBadge: tutorProfiles.verifiedBadge,
        score: sql<number>`
          (${tutorProfiles.avgRating}::float * 10) + 
          (${tutorProfiles.totalSessions}::float * 2) + 
          (${tutorProfiles.totalHours}::float)
        `,
      })
      .from(tutorProfiles)
      .orderBy(desc(sql`(${tutorProfiles.avgRating}::float * 10) + (${tutorProfiles.totalSessions}::float * 2) + (${tutorProfiles.totalHours}::float)`))
      .limit(10);

    // Top learners by sessions + hours
    const topLearners = await db
      .select({
        userId: p2pLearnerProfiles.userId,
        anonymousName: p2pLearnerProfiles.anonymousName,
        avatarUrl: p2pLearnerProfiles.avatarUrl,
        interests: p2pLearnerProfiles.interests,
        totalHours: p2pLearnerProfiles.totalHours,
        totalSessions: p2pLearnerProfiles.totalSessions,
        score: sql<number>`
          (${p2pLearnerProfiles.totalSessions}::float * 5) + 
          (${p2pLearnerProfiles.totalHours}::float * 2)
        `,
      })
      .from(p2pLearnerProfiles)
      .orderBy(desc(sql`(${p2pLearnerProfiles.totalSessions}::float * 5) + (${p2pLearnerProfiles.totalHours}::float * 2)`))
      .limit(10);

    return NextResponse.json({
      tutors: topTutors,
      learners: topLearners,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
