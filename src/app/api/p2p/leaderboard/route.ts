import { NextResponse } from "next/server";
import { db } from "@/modules/core/db/sqlite";
import { tutorProfiles, p2pLearnerProfiles } from "@/modules/core/db/sqlite-schema";
import { desc, sql } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/sanitize";

// GET /api/p2p/leaderboard - Get top tutors and learners
export async function GET(request: Request) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  try {
    // Top tutors by rating + sessions
    const topTutors = db
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
      })
      .from(tutorProfiles)
      .all();

    // Sort by score in JS (SQLite doesn't support complex SQL expressions as easily)
    topTutors.sort((a: any, b: any) => {
      const scoreA = (Number(a.avgRating) || 0) * 10 + (Number(a.totalSessions) || 0) * 2 + (Number(a.totalHours) || 0);
      const scoreB = (Number(b.avgRating) || 0) * 10 + (Number(b.totalSessions) || 0) * 2 + (Number(b.totalHours) || 0);
      return scoreB - scoreA;
    });

    // Top learners by sessions + hours
    const topLearners = db
      .select({
        userId: p2pLearnerProfiles.userId,
        anonymousName: p2pLearnerProfiles.anonymousName,
        avatarUrl: p2pLearnerProfiles.avatarUrl,
        interests: p2pLearnerProfiles.interests,
        totalHours: p2pLearnerProfiles.totalHours,
        totalSessions: p2pLearnerProfiles.totalSessions,
      })
      .from(p2pLearnerProfiles)
      .all();

    topLearners.sort((a: any, b: any) => {
      const scoreA = (Number(a.totalSessions) || 0) * 5 + (Number(a.totalHours) || 0) * 2;
      const scoreB = (Number(b.totalSessions) || 0) * 5 + (Number(b.totalHours) || 0) * 2;
      return scoreB - scoreA;
    });

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
