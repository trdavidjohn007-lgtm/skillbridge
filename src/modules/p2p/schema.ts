import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "../core/db/schema";

// ============================================================
// P2P TUTORING ENUMS
// ============================================================

export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "matched",
  "expired",
  "cancelled",
]);

export const sessionStatusEnum = pgEnum("session_status", [
  "active",
  "completed",
  "reported",
  "cancelled",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "reviewed",
  "resolved",
]);

export const resourceTypeEnum = pgEnum("resource_type", [
  "video",
  "course",
  "practice",
  "docs",
  "interactive",
]);

export const difficultyEnum = pgEnum("difficulty_level_p2p", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const bookmarkStatusEnum = pgEnum("bookmark_status", [
  "bookmarked",
  "started",
  "completed",
]);

export const creditTxTypeEnum = pgEnum("credit_tx_type", [
  "session_earn",
  "session_spend",
  "signup_bonus",
  "admin_adjust",
]);

// ============================================================
// TUTOR PROFILES
// ============================================================

export const tutorProfiles = pgTable(
  "tutor_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    subjects: text("subjects").array().notNull().default([]),
    isOnline: boolean("is_online").notNull().default(false),
    totalHours: decimal("total_hours", { precision: 7, scale: 1 })
      .notNull()
      .default("0"),
    totalSessions: integer("total_sessions").notNull().default(0),
    avgRating: decimal("avg_rating", { precision: 3, scale: 2 })
      .notNull()
      .default("0"),
    trustScore: decimal("trust_score", { precision: 3, scale: 2 })
      .notNull()
      .default("5.00"),
    verifiedBadge: boolean("verified_badge").notNull().default(false),
    anonymousName: text("anonymous_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_tutor_user").on(table.userId),
    index("idx_tutor_online").on(table.isOnline),
    index("idx_tutor_rating").on(table.avgRating),
  ]
);

// ============================================================
// LEARNER PROFILES (P2P)
// ============================================================

export const p2pLearnerProfiles = pgTable(
  "p2p_learner_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    interests: text("interests").array().notNull().default([]),
    totalHours: decimal("total_hours", { precision: 7, scale: 1 })
      .notNull()
      .default("0"),
    totalSessions: integer("total_sessions").notNull().default(0),
    anonymousName: text("anonymous_name"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_p2p_learner_user").on(table.userId)]
);

// ============================================================
// HELP REQUESTS
// ============================================================

export const helpRequests = pgTable(
  "help_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topic: text("topic").notNull(),
    description: text("description"),
    tags: text("tags").array().notNull().default([]),
    durationMins: integer("duration_mins").notNull().default(30),
    creditCost: integer("credit_cost").notNull().default(30),
    status: requestStatusEnum("status").notNull().default("pending"),
    matchedTutorId: uuid("matched_tutor_id").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (table) => [
    index("idx_request_learner").on(table.learnerId),
    index("idx_request_status").on(table.status),
    index("idx_request_created").on(table.createdAt),
  ]
);

// ============================================================
// SESSIONS
// ============================================================

export const sessions = pgTable(
  "p2p_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => helpRequests.id),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => users.id),
    tutorId: uuid("tutor_id")
      .notNull()
      .references(() => users.id),
    status: sessionStatusEnum("status").notNull().default("active"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    endedAt: timestamp("ended_at"),
    durationSeconds: integer("duration_seconds"),
    creditsTransferred: integer("credits_transferred"),
  },
  (table) => [
    index("idx_session_learner").on(table.learnerId),
    index("idx_session_tutor").on(table.tutorId),
    index("idx_session_status").on(table.status),
  ]
);

// ============================================================
// SESSION MESSAGES
// ============================================================

export const sessionMessages = pgTable(
  "session_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id),
    content: text("content").notNull(),
    isSystem: boolean("is_system").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_msg_session").on(table.sessionId),
    index("idx_msg_created").on(table.createdAt),
  ]
);

// ============================================================
// CREDIT LEDGER
// ============================================================

export const creditLedger = pgTable(
  "credit_ledger",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id),
    amount: integer("amount").notNull(),
    type: creditTxTypeEnum("type").notNull(),
    description: text("description"),
    sessionId: uuid("session_id").references(() => sessions.id),
    balance: integer("balance").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_credit_user").on(table.userId),
    index("idx_credit_created").on(table.createdAt),
  ]
);

// ============================================================
// RATINGS
// ============================================================

export const ratings = pgTable(
  "p2p_ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id),
    fromUserId: uuid("from_user_id")
      .notNull()
      .references(() => users.id),
    toUserId: uuid("to_user_id")
      .notNull()
      .references(() => users.id),
    stars: integer("stars").notNull(),
    tags: text("tags").array().notNull().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_rating_session").on(table.sessionId),
    index("idx_rating_to").on(table.toUserId),
    uniqueIndex("idx_rating_unique").on(
      table.sessionId,
      table.fromUserId
    ),
  ]
);

// ============================================================
// REPORTS
// ============================================================

export const reports = pgTable(
  "p2p_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id),
    reporterId: uuid("reporter_id")
      .notNull()
      .references(() => users.id),
    reason: text("reason").notNull(),
    status: reportStatusEnum("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_report_session").on(table.sessionId),
    index("idx_report_status").on(table.status),
  ]
);

// ============================================================
// RESOURCES
// ============================================================

export const resources = pgTable(
  "p2p_resources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    topic: text("topic").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    platform: text("platform").notNull(),
    type: resourceTypeEnum("type").notNull(),
    difficulty: difficultyEnum("difficulty").notNull(),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_resource_topic").on(table.topic),
    index("idx_resource_type").on(table.type),
  ]
);

// ============================================================
// USER BOOKMARKS
// ============================================================

export const userBookmarks = pgTable(
  "user_bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id, { onDelete: "cascade" }),
    status: bookmarkStatusEnum("status").notNull().default("bookmarked"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_bookmark_unique").on(
      table.userId,
      table.resourceId
    ),
    index("idx_bookmark_user").on(table.userId),
  ]
);

// ============================================================
// ACHIEVEMENTS / BADGES
// ============================================================

export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    badgeType: text("badge_type").notNull(),
    badgeName: text("badge_name").notNull(),
    badgeIcon: text("badge_icon").notNull(),
    earnedAt: timestamp("earned_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_badge_user").on(table.userId),
    uniqueIndex("idx_badge_type_unique").on(
      table.userId,
      table.badgeType
    ),
  ]
);

// ============================================================
// RELATIONS
// ============================================================

export const tutorProfilesRelations = relations(
  tutorProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [tutorProfiles.userId],
      references: [users.id],
    }),
  })
);

export const p2pLearnerProfilesRelations = relations(
  p2pLearnerProfiles,
  ({ one }) => ({
    user: one(users, {
      fields: [p2pLearnerProfiles.userId],
      references: [users.id],
    }),
  })
);

export const helpRequestsRelations = relations(
  helpRequests,
  ({ one }) => ({
    learner: one(users, {
      fields: [helpRequests.learnerId],
      references: [users.id],
    }),
    matchedTutor: one(users, {
      fields: [helpRequests.matchedTutorId],
      references: [users.id],
    }),
  })
);

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  request: one(helpRequests, {
    fields: [sessions.requestId],
    references: [helpRequests.id],
  }),
  learner: one(users, {
    fields: [sessions.learnerId],
    references: [users.id],
  }),
  tutor: one(users, {
    fields: [sessions.tutorId],
    references: [users.id],
  }),
  messages: many(sessionMessages),
}));

export const sessionMessagesRelations = relations(
  sessionMessages,
  ({ one }) => ({
    session: one(sessions, {
      fields: [sessionMessages.sessionId],
      references: [sessions.id],
    }),
    sender: one(users, {
      fields: [sessionMessages.senderId],
      references: [users.id],
    }),
  })
);

export const creditLedgerRelations = relations(
  creditLedger,
  ({ one }) => ({
    user: one(users, {
      fields: [creditLedger.userId],
      references: [users.id],
    }),
    session: one(sessions, {
      fields: [creditLedger.sessionId],
      references: [sessions.id],
    }),
  })
);

export const ratingsRelations = relations(ratings, ({ one }) => ({
  session: one(sessions, {
    fields: [ratings.sessionId],
    references: [sessions.id],
  }),
  fromUser: one(users, {
    fields: [ratings.fromUserId],
    references: [users.id],
  }),
  toUser: one(users, {
    fields: [ratings.toUserId],
    references: [users.id],
  }),
}));

export const userBookmarksRelations = relations(
  userBookmarks,
  ({ one }) => ({
    user: one(users, {
      fields: [userBookmarks.userId],
      references: [users.id],
    }),
    resource: one(resources, {
      fields: [userBookmarks.resourceId],
      references: [resources.id],
    }),
  })
);
