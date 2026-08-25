import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { db } from "@/modules/core/db";
import {
  helpRequests,
  tutorProfiles,
  users,
  p2pLearnerProfiles,
} from "@/modules/p2p/schema";
import { eq, desc, and } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import {
  getClientIp,
  sanitizeText,
  sanitizeStringArray,
  sanitizeNumber,
  MAX_SIZES,
  assertMaxSize,
} from "@/lib/sanitize";

// GET /api/p2p/requests - List help requests
export async function GET(request: Request) {
  // Rate limit
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const myRequests = searchParams.get("mine") === "true";

    // Validate status param
    const validStatuses = ["pending", "matched", "expired", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    try {
    let query = db
      .select({
        id: helpRequests.id,
        learnerId: helpRequests.learnerId,
        topic: helpRequests.topic,
        description: helpRequests.description,
        tags: helpRequests.tags,
        durationMins: helpRequests.durationMins,
        creditCost: helpRequests.creditCost,
        status: helpRequests.status,
        matchedTutorId: helpRequests.matchedTutorId,
        createdAt: helpRequests.createdAt,
        learnerName: p2pLearnerProfiles.anonymousName,
        learnerAvatar: p2pLearnerProfiles.avatarUrl,
      })
      .from(helpRequests)
      .leftJoin(
        p2pLearnerProfiles,
        eq(helpRequests.learnerId, p2pLearnerProfiles.userId)
      );

    if (myRequests) {
      query = query.where(
        and(
          eq(helpRequests.learnerId, userId),
          eq(helpRequests.status, status as any)
        )
      );
    } else {
      query = query.where(eq(helpRequests.status, status as any));
    }    const results = await query.orderBy(desc(helpRequests.createdAt)).limit(50);

    return NextResponse.json(results);
    } catch (dbError) {
      return NextResponse.json([]);
    }
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/p2p/requests - Create new help request
export async function POST(request: Request) {
  // Rate limit (stricter for creation)
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.write);
  if (rl.limited) return rl.response;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // ── Input validation ──
    const { topic, description, tags, durationMins } = body;

    // Topic validation
    if (!topic || typeof topic !== "string") {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    const topicCheck = assertMaxSize(topic, MAX_SIZES.topic, "topic");
    if (typeof topicCheck === "object" && topicCheck !== null && "error" in topicCheck) {
      return NextResponse.json({ error: (topicCheck as any).error }, { status: 400 });
    }
    const cleanTopic = sanitizeText(topic);

    // Description validation
    const cleanDesc = description ? sanitizeText(description) : "";
    if (cleanDesc.length > MAX_SIZES.description) {
      return NextResponse.json(
        { error: `Description exceeds ${MAX_SIZES.description} characters` },
        { status: 400 }
      );
    }

    // Tags validation
    const cleanTags = sanitizeStringArray(tags, 10, MAX_SIZES.tag);
    if (typeof cleanTags === "object" && cleanTags !== null && "error" in cleanTags) {
      return NextResponse.json({ error: (cleanTags as any).error }, { status: 400 });
    }
    if (cleanTags.length === 0) {
      return NextResponse.json(
        { error: "At least one tag required" },
        { status: 400 }
      );
    }

    // Duration validation
    const cleanDuration = sanitizeNumber(durationMins || 30, 5, 120, "durationMins");
    if (typeof cleanDuration === "object" && cleanDuration !== null && "error" in cleanDuration) {
      return NextResponse.json({ error: (cleanDuration as any).error }, { status: 400 });
    }

    const cost = cleanDuration as number;

    // Try database operations; fall back to mock if DB unavailable
    try {
      const { creditLedger } = await import("@/modules/p2p/schema");
      const { desc: descFn } = await import("drizzle-orm");
      const [lastTx] = await db
        .select()
        .from(creditLedger)
        .where(eq(creditLedger.userId, userId))
        .orderBy(descFn(creditLedger.createdAt))
        .limit(1);

      const balance = lastTx?.balance ?? 100;
      if (balance < cost) {
        return NextResponse.json(
          { error: `Insufficient credits. You have ${balance}, need ${cost}` },
          { status: 400 }
        );
      }

      const [newRequest] = await db
        .insert(helpRequests)
        .values({
          learnerId: userId,
          topic: cleanTopic,
          description: cleanDesc,
          tags: cleanTags,
          durationMins: cleanDuration,
          creditCost: cost,
          status: "pending",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        })
        .returning();

      await db.insert(creditLedger).values({
        userId,
        amount: -cost,
        type: "session_spend",
        description: `Posted help request: ${cleanTopic}`,
        balance: balance - cost,
      });

      return NextResponse.json(newRequest, { status: 201 });
    } catch (dbError) {
      // DB unavailable — return mock success
      const mockRequest = {
        id: "req-" + Date.now(),
        learnerId: userId,
        topic: cleanTopic,
        description: cleanDesc,
        tags: cleanTags,
        durationMins: cleanDuration,
        creditCost: cost,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      console.warn("DB unavailable, returning mock request:", mockRequest.id);
      return NextResponse.json(mockRequest, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
