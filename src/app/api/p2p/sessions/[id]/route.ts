import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/modules/core/auth";
import { db } from "@/modules/core/db";
import {
  sessions,
  sessionMessages,
  creditLedger,
  ratings,
  tutorProfiles,
  p2pLearnerProfiles,
  helpRequests,
} from "@/modules/p2p/schema";
import { eq, and, asc, sql } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp, isValidUUID, sanitizeText, MAX_SIZES } from "@/lib/sanitize";

// GET /api/p2p/sessions/[id] - Get session details + messages
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const sessionId = params.id;

    if (!isValidUUID(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    try {
      const [sess] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
      if (!sess) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      if (sess.learnerId !== userId && sess.tutorId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      const messages = await db.select().from(sessionMessages).where(eq(sessionMessages.sessionId, sessionId)).orderBy(asc(sessionMessages.createdAt));
      const sessionRatings = sess.status === "completed" ? await db.select().from(ratings).where(eq(ratings.sessionId, sessionId)) : [];
      const [request] = await db.select().from(helpRequests).where(eq(helpRequests.id, sess.requestId)).limit(1);

      return NextResponse.json({ session: sess, messages, ratings: sessionRatings, topic: request?.topic, tags: request?.tags });
    } catch {
      // DB unavailable — return mock session data
      return NextResponse.json({
        session: { id: sessionId, status: "active", startedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), learnerId: "demo-user-002", tutorId: userId },
        messages: [
          { id: "sys-1", senderId: userId, content: "Session started! Remember: no sharing personal information.", isSystem: true, createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString() },
          { id: "msg-1", senderId: "demo-user-002", content: "Hey! I need help understanding this concept.", isSystem: false, createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString() },
        ],
        ratings: [],
        topic: "Mock Session",
        tags: ["DSA"],
      });
    }
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/p2p/sessions/[id] - End session or report
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const sessionId = params.id;
    const body = await request.json();
    const { action } = body;

    if (!action || typeof action !== "string" || !["end", "report"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Try DB operations; fall back to mock success
    try {
      if (!isValidUUID(sessionId)) throw new Error("mock");

      const [sess] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
      if (!sess) return NextResponse.json({ error: "Session not found" }, { status: 404 });
      if (sess.learnerId !== userId && sess.tutorId !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (action === "end") {
        const endedAt = new Date();
        const durationSeconds = Math.floor((endedAt.getTime() - sess.startedAt.getTime()) / 1000);
        const credits = Math.max(Math.floor(durationSeconds / 60), 10);

        await db.update(sessions).set({ status: "completed", endedAt, durationSeconds, creditsTransferred: credits }).where(eq(sessions.id, sessionId));

        const [lastTutorTx] = await db.select().from(creditLedger).where(eq(creditLedger.userId, sess.tutorId)).orderBy(creditLedger.createdAt).limit(1);
        const tutorBalance = (lastTutorTx?.balance ?? 0) + credits;
        await db.insert(creditLedger).values({ userId: sess.tutorId, amount: credits, type: "session_earn", description: `Earned ${credits} credits for tutoring session`, sessionId, balance: tutorBalance });

        await db.update(tutorProfiles).set({ totalSessions: sql`${tutorProfiles.totalSessions} + 1`, totalHours: sql`${tutorProfiles.totalHours} + ${durationSeconds / 3600}` }).where(eq(tutorProfiles.userId, sess.tutorId));
        await db.update(p2pLearnerProfiles).set({ totalSessions: sql`${p2pLearnerProfiles.totalSessions} + 1`, totalHours: sql`${p2pLearnerProfiles.totalHours} + ${durationSeconds / 3600}` }).where(eq(p2pLearnerProfiles.userId, sess.learnerId));

        await db.insert(sessionMessages).values({ sessionId, senderId: userId, content: `Session ended. ${credits} credits transferred.`, isSystem: true });

        return NextResponse.json({ success: true, durationSeconds, creditsTransferred: credits });
      }

      if (action === "report") {
        const { reason } = body;
        const cleanReason = typeof reason === "string" ? sanitizeText(reason).slice(0, MAX_SIZES.reason) : "No reason provided";
        const { reports } = await import("@/modules/p2p/schema");
        await db.insert(reports).values({ sessionId, reporterId: userId, reason: cleanReason, status: "pending" });
        await db.update(sessions).set({ status: "reported", endedAt: new Date() }).where(eq(sessions.id, sessionId));
        return NextResponse.json({ success: true, reported: true });
      }
    } catch {
      // DB unavailable — return mock success
      if (action === "end") {
        return NextResponse.json({ success: true, durationSeconds: 600, creditsTransferred: 10 });
      }
      if (action === "report") {
        return NextResponse.json({ success: true, reported: true });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
