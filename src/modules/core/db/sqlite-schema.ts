import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============================================================
// USERS
// ============================================================
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("learner"),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ============================================================
// TUTOR PROFILES
// ============================================================
export const tutorProfiles = sqliteTable("tutor_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  subjects: text("subjects").default("[]"), // JSON array
  isOnline: integer("is_online", { mode: "boolean" }).default(false),
  totalHours: real("total_hours").default(0),
  totalSessions: integer("total_sessions").default(0),
  avgRating: real("avg_rating").default(0),
  trustScore: real("trust_score").default(5.0),
  verifiedBadge: integer("verified_badge", { mode: "boolean" }).default(false),
  anonymousName: text("anonymous_name"),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// ============================================================
// LEARNER PROFILES
// ============================================================
export const p2pLearnerProfiles = sqliteTable("p2p_learner_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  interests: text("interests").default("[]"), // JSON array
  totalHours: real("total_hours").default(0),
  totalSessions: integer("total_sessions").default(0),
  anonymousName: text("anonymous_name"),
  avatarUrl: text("avatar_url"),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

// ============================================================
// HELP REQUESTS
// ============================================================
export const helpRequests = sqliteTable("help_requests", {
  id: text("id").primaryKey(),
  learnerId: text("learner_id").notNull(),
  topic: text("topic").notNull(),
  description: text("description"),
  tags: text("tags").default("[]"), // JSON array
  durationMins: integer("duration_mins").default(30),
  creditCost: integer("credit_cost").default(30),
  status: text("status").default("pending"), // pending, matched, expired, cancelled
  matchedTutorId: text("matched_tutor_id"),
  createdAt: text("created_at").default(new Date().toISOString()),
  expiresAt: text("expires_at"),
});

// ============================================================
// SESSIONS
// ============================================================
export const sessions = sqliteTable("p2p_sessions", {
  id: text("id").primaryKey(),
  requestId: text("request_id").notNull(),
  learnerId: text("learner_id").notNull(),
  tutorId: text("tutor_id").notNull(),
  status: text("status").default("active"), // active, completed, reported, cancelled
  startedAt: text("started_at").default(new Date().toISOString()),
  endedAt: text("ended_at"),
  durationSeconds: integer("duration_seconds"),
  creditsTransferred: integer("credits_transferred"),
});

// ============================================================
// SESSION MESSAGES
// ============================================================
export const sessionMessages = sqliteTable("session_messages", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  senderId: text("sender_id").notNull(),
  content: text("content").notNull(),
  isSystem: integer("is_system", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ============================================================
// CREDIT LEDGER
// ============================================================
export const creditLedger = sqliteTable("credit_ledger", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // session_earn, session_spend, signup_bonus, admin_adjust
  description: text("description"),
  sessionId: text("session_id"),
  balance: integer("balance").notNull(),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ============================================================
// RATINGS
// ============================================================
export const ratings = sqliteTable("p2p_ratings", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  fromUserId: text("from_user_id").notNull(),
  toUserId: text("to_user_id").notNull(),
  stars: integer("stars").notNull(),
  tags: text("tags").default("[]"), // JSON array
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ============================================================
// REPORTS
// ============================================================
export const reports = sqliteTable("p2p_reports", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  reporterId: text("reporter_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending"),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ============================================================
// RESOURCES
// ============================================================
export const resources = sqliteTable("p2p_resources", {
  id: text("id").primaryKey(),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  platform: text("platform").notNull(),
  type: text("type").notNull(), // video, course, practice, docs, interactive
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  description: text("description"),
  thumbnailUrl: text("thumbnail_url"),
  createdAt: text("created_at").default(new Date().toISOString()),
});

// ============================================================
// NOTIFICATIONS
// ============================================================
export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  sessionId: text("session_id"),
  topic: text("topic"),
  read: integer("read", { mode: "boolean" }).default(false),
  createdAt: text("created_at").default(new Date().toISOString()),
});
