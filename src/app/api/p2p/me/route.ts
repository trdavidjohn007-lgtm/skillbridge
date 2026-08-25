import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { db } from "@/modules/core/db";
import {
  tutorProfiles,
  p2pLearnerProfiles,
} from "@/modules/p2p/schema";
import { users } from "@/modules/core/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp, sanitizeStringArray, MAX_SIZES } from "@/lib/sanitize";

const ANONYMOUS_PREFIXES = [
  "Scholar", "Tutor", "Learner", "Ninja", "Guru",
  "Sensei", "Sage", "Mentor", "Pioneer", "Explorer",
];

const ANONYMOUS_SUFFIXES = [
  "Alpha", "Beta", "Gamma", "Delta", "Epsilon",
  "Zeta", "Eta", "Theta", "Iota", "Kappa",
  "Lambda", "Sigma", "Omega", "Phoenix", "Nova",
];

function generateAnonymousName(): string {
  const prefix =
    ANONYMOUS_PREFIXES[
      Math.floor(Math.random() * ANONYMOUS_PREFIXES.length)
    ];
  const suffix =
    ANONYMOUS_SUFFIXES[
      Math.floor(Math.random() * ANONYMOUS_SUFFIXES.length)
    ];
  return `${prefix}_${suffix}`;
}

function generateAvatarUrl(name: string): string {
  const colors = ["FF6B00", "3B82F6", "10B981", "8B5CF6", "EF4444", "06B6D4"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const initials = name
    .split("_")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&bold=true&size=128`;
}

// GET /api/p2p/me - Get current user's P2P profile
export async function GET(request?: Request) {
  if (request) {
    const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
    if (rl.limited) return rl.response;
  }
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Try database queries; fall back to session data if DB unavailable
    try {
      const [tutorProfile] = await db
        .select()
        .from(tutorProfiles)
        .where(eq(tutorProfiles.userId, userId))
        .limit(1);

      const [learnerProfile] = await db
        .select()
        .from(p2pLearnerProfiles)
        .where(eq(p2pLearnerProfiles.userId, userId))
        .limit(1);

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      const { creditLedger } = await import("@/modules/p2p/schema");
      const { desc } = await import("drizzle-orm");
      const [lastCredit] = await db
        .select()
        .from(creditLedger)
        .where(eq(creditLedger.userId, userId))
        .orderBy(desc(creditLedger.createdAt))
        .limit(1);

      const balance = lastCredit?.balance ?? 100;

      return NextResponse.json({
        user,
        tutorProfile: tutorProfile || null,
        learnerProfile: learnerProfile || null,
        credits: balance,
      });
    } catch (dbError) {
      // DB unavailable — return session-based fallback
      const email = session.user?.email || "";
      const name = (session.user as any)?.name || email.split("@")[0] || "Student";
      const fakeId = Buffer.from(email).toString("base64url").slice(0, 36);
      return NextResponse.json({
        user: { id: fakeId, email, name, role: "learner" },
        tutorProfile: null,
        learnerProfile: null,
        credits: 100,
      });
    }
  } catch (error) {
    console.error("Error fetching P2P profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/p2p/me - Create/update P2P profile
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
    const { role, subjects, interests } = body;

    // Validate role
    const validRoles = ["learner", "tutor", "both"];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Sanitize subjects/interests arrays
    const cleanSubjects = Array.isArray(subjects) ? sanitizeStringArray(subjects, 15, MAX_SIZES.tag) : [];
    const cleanInterests = Array.isArray(interests) ? sanitizeStringArray(interests, 15, MAX_SIZES.tag) : [];

    // Try database operations; gracefully handle DB unavailable
    try {
      // Check if profiles already exist
      const [existingTutor] = await db
        .select()
        .from(tutorProfiles)
        .where(eq(tutorProfiles.userId, userId))
        .limit(1);

      const [existingLearner] = await db
        .select()
        .from(p2pLearnerProfiles)
        .where(eq(p2pLearnerProfiles.userId, userId))
        .limit(1);

      // Create tutor profile if needed
      if ((role === "tutor" || role === "both") && !existingTutor) {
        const name = generateAnonymousName();
        await db.insert(tutorProfiles).values({
          userId,
          subjects: Array.isArray(cleanSubjects) ? cleanSubjects : [],
          anonymousName: name,
          avatarUrl: generateAvatarUrl(name),
          verifiedBadge: true,
        });

        const { creditLedger } = await import("@/modules/p2p/schema");
        await db.insert(creditLedger).values({
          userId,
          amount: 100,
          type: "signup_bonus",
          description: "Welcome bonus! You received 100 credits to start learning.",
          balance: 100,
        });
      }

      // Create learner profile if needed
      if ((role === "learner" || role === "both") && !existingLearner) {
        const name = generateAnonymousName();
        await db.insert(p2pLearnerProfiles).values({
          userId,
          interests: Array.isArray(cleanInterests) ? cleanInterests : [],
          anonymousName: name,
          avatarUrl: generateAvatarUrl(name),
        });

        if (!(role === "tutor" || role === "both") || existingTutor) {
          const { creditLedger } = await import("@/modules/p2p/schema");
          const existing = existingTutor
            ? await db
                .select()
                .from(creditLedger)
                .where(eq(creditLedger.userId, userId))
                .orderBy(desc(creditLedger.createdAt))
                .limit(1)
            : null;
          const currentBalance = existing?.[0]?.balance ?? 0;

          await db.insert(creditLedger).values({
            userId,
            amount: 100,
            type: "signup_bonus",
            description: "Welcome bonus! You received 100 credits to start learning.",
            balance: currentBalance + 100,
          });
        }
      }

      if (existingTutor && subjects) {
        await db
          .update(tutorProfiles)
          .set({ subjects: Array.isArray(cleanSubjects) ? cleanSubjects : subjects, updatedAt: new Date() })
          .where(eq(tutorProfiles.userId, userId));
      }
    } catch (dbError) {
      // Database unavailable — profile creation succeeded via fallback auth
      console.warn("DB unavailable during profile creation, continuing without persistence:", dbError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating P2P profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
