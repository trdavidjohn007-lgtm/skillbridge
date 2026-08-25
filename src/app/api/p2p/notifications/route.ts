import { NextResponse } from "next/server";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/sanitize";

// In-memory notification store (resets on server restart)
const notifications = new Map<string, any[]>();

// Seed some demo notifications
function getDemoNotifications(userId: string) {
  if (notifications.has(userId)) return notifications.get(userId)!;

  const demoNotifs = [
    {
      id: "notif-1",
      type: "request_accepted",
      title: "Your request was accepted!",
      message: "Tutor_Nova accepted your request for 'Binary Trees in DSA'. Session is starting.",
      sessionId: "sess-demo-001",
      topic: "Binary Trees in DSA",
      read: false,
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    },
    {
      id: "notif-2",
      type: "session_complete",
      title: "Session completed! +30 credits",
      message: "Your tutoring session on 'React useEffect patterns' is complete. You earned 30 credits.",
      sessionId: "sess-demo-002",
      topic: "React useEffect patterns",
      read: true,
      createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: "notif-3",
      type: "request_accepted",
      title: "Your request was accepted!",
      message: "Tutor_Sigma accepted your request for 'SQL JOIN types explained'. Join now!",
      sessionId: "sess-demo-003",
      topic: "SQL JOIN types explained",
      read: true,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "notif-4",
      type: "new_match",
      title: "New tutor available!",
      message: "A verified tutor in 'Machine Learning' just came online. Post a request to connect!",
      sessionId: null,
      topic: "Machine Learning",
      read: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
  ];

  notifications.set(userId, demoNotifs);
  return demoNotifs;
}

// GET /api/p2p/notifications - Get user notifications
export async function GET(request: Request) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.read);
  if (rl.limited) return rl.response;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default-user";

    const notifs = getDemoNotifications(userId);
    const unreadCount = notifs.filter((n) => !n.read).length;

    return NextResponse.json({ notifications: notifs, unreadCount });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}

// POST /api/p2p/notifications - Mark as read or mark all as read
export async function POST(request: Request) {
  const rl = rateLimit(getClientIp(request), RATE_LIMITS.write);
  if (rl.limited) return rl.response;

  try {
    const body = await request.json();
    const { userId = "default-user", notificationId, markAll } = body;

    const notifs = getDemoNotifications(userId);

    if (markAll) {
      notifs.forEach((n) => (n.read = true));
    } else if (notificationId) {
      const notif = notifs.find((n) => n.id === notificationId);
      if (notif) notif.read = true;
    }

    const unreadCount = notifs.filter((n) => !n.read).length;
    return NextResponse.json({ notifications: notifs, unreadCount });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/p2p/notifications - Add a new notification (called when a request is accepted)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId = "default-user", type, title, message, sessionId, topic } = body;

    const notifs = getDemoNotifications(userId);
    const newNotif = {
      id: "notif-" + Date.now(),
      type: type || "request_accepted",
      title,
      message,
      sessionId: sessionId || null,
      topic: topic || null,
      read: false,
      createdAt: new Date().toISOString(),
    };

    notifs.unshift(newNotif);
    const unreadCount = notifs.filter((n) => !n.read).length;

    return NextResponse.json({ notification: newNotif, unreadCount }, { status: 201 });
  } catch (error) {
    console.error("Error creating notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
