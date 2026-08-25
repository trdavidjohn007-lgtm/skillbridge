import {
  pgTable,
  uuid,
  text,
  timestamp,
  decimal,
  integer,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================
// ENUMS
// ============================================================

export const competencyDomainEnum = pgEnum("competency_domain", [
  "statistical",
  "technical",
  "digital_governance",
  "behavioural",
]);

export const competencyLevelEnum = pgEnum("competency_level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export const edgeRelationshipEnum = pgEnum("edge_relationship", [
  "prerequisite",
  "related",
  "progression",
]);

export const assessedByEnum = pgEnum("assessed_by", ["self", "ai", "trainer"]);

export const learnerRoleEnum = pgEnum("learner_role", [
  "super_admin",
  "dept_admin",
  "trainer",
  "learner",
]);

export const pathStatusEnum = pgEnum("path_status", [
  "active",
  "completed",
  "paused",
]);

export const nodeStatusEnum = pgEnum("node_status", [
  "recommended",
  "enrolled",
  "in_progress",
  "completed",
]);

export const courseSourceEnum = pgEnum("course_source", ["igot", "tpac"]);

export const questionTypeEnum = pgEnum("question_type", [
  "mcq",
  "true_false",
  "short_answer",
]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
  "easy",
  "medium",
  "hard",
]);

export const validationStatusEnum = pgEnum("validation_status", [
  "pending",
  "validated",
  "rejected",
]);

export const questionOriginEnum = pgEnum("question_origin", [
  "ai",
  "trainer",
  "imported",
]);

export const syncTypeEnum = pgEnum("sync_type", ["full", "incremental"]);

export const syncStatusEnum = pgEnum("sync_status", [
  "success",
  "partial",
  "failed",
]);

export const gapPriorityEnum = pgEnum("gap_priority", [
  "critical",
  "high",
  "medium",
  "low",
]);

// ============================================================
// USERS & AUTHENTICATION
// ============================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: learnerRoleEnum("role").notNull().default("learner"),
  ssoProvider: text("sso_provider"),
  ssoId: text("sso_id"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================
// COMPETENCY FRAMEWORK (DAG)
// ============================================================

export const competencies = pgTable(
  "competencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    domain: competencyDomainEnum("domain").notNull(),
    level: competencyLevelEnum("level").notNull(),
    frameworkVersion: text("framework_version").notNull().default("1.0.0"),
    isActive: text("is_active").notNull().default("true"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_competencies_domain").on(table.domain),
    index("idx_competencies_level").on(table.level),
    index("idx_competencies_framework").on(table.frameworkVersion),
  ]
);

export const competencyEdges = pgTable(
  "competency_edges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    targetId: uuid("target_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    relationship: edgeRelationshipEnum("relationship").notNull(),
  },
  (table) => [
    uniqueIndex("idx_edge_unique").on(
      table.sourceId,
      table.targetId,
      table.relationship
    ),
    index("idx_edges_source").on(table.sourceId),
    index("idx_edges_target").on(table.targetId),
  ]
);

// ============================================================
// ROLE REQUIREMENTS
// ============================================================

export const roleRequirements = pgTable(
  "role_requirements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    roleName: text("role_name").notNull(),
    department: text("department"),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    requiredLevel: competencyLevelEnum("required_level").notNull(),
    priority: gapPriorityEnum("priority").notNull().default("medium"),
  },
  (table) => [
    index("idx_role_req_role").on(table.roleName),
    index("idx_role_req_dept").on(table.department),
  ]
);

// ============================================================
// LEARNER PROFILES
// ============================================================

export const learnerProfiles = pgTable(
  "learner_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    employeeId: text("employee_id").unique(),
    designation: text("designation"),
    department: text("department"),
    jobRole: text("job_role"),
    education: jsonb("education"),
    workExperienceYears: integer("work_experience_years"),
    previousTrainings: jsonb("previous_trainings"),
    preferredLanguage: text("preferred_language").notNull().default("en"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_learner_dept").on(table.department),
    index("idx_learner_role").on(table.jobRole),
  ]
);

// ============================================================
// COMPETENCY ASSESSMENTS
// ============================================================

export const competencyAssessments = pgTable(
  "competency_assessments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learnerProfiles.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    currentLevel: competencyLevelEnum("current_level").notNull(),
    assessedBy: assessedByEnum("assessed_by").notNull(),
    confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
    assessedAt: timestamp("assessed_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("idx_assessment_unique").on(
      table.learnerId,
      table.competencyId
    ),
  ]
);

// ============================================================
// SKILL GAPS
// ============================================================

export const skillGaps = pgTable(
  "skill_gaps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learnerProfiles.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    currentLevel: competencyLevelEnum("current_level").notNull(),
    targetLevel: competencyLevelEnum("target_level").notNull(),
    gapSize: integer("gap_size").notNull(),
    priority: gapPriorityEnum("priority").notNull(),
    identifiedAt: timestamp("identified_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_gap_learner").on(table.learnerId),
    index("idx_gap_priority").on(table.priority),
  ]
);

// ============================================================
// LEARNING PATHS
// ============================================================

export const learningPaths = pgTable(
  "learning_paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learnerProfiles.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    status: pathStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("idx_path_learner").on(table.learnerId)]
);

export const learningPathNodes = pgTable(
  "learning_path_nodes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pathId: uuid("path_id")
      .notNull()
      .references(() => learningPaths.id, { onDelete: "cascade" }),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    courseId: text("course_id"),
    source: courseSourceEnum("source").notNull(),
    displayOrder: integer("display_order").notNull(),
    status: nodeStatusEnum("status").notNull().default("recommended"),
    estimatedHours: decimal("estimated_hours", { precision: 5, scale: 1 }),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_pathnode_path").on(table.pathId),
    index("idx_pathnode_status").on(table.status),
  ]
);

// ============================================================
// QUESTION BANK & ASSESSMENTS
// ============================================================

export const questionBank = pgTable(
  "question_bank",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),
    sourceMaterialId: uuid("source_material_id"),
    questionText: text("question_text").notNull(),
    questionType: questionTypeEnum("question_type").notNull(),
    options: jsonb("options"),
    correctAnswer: text("correct_answer").notNull(),
    explanation: text("explanation"),
    difficulty: difficultyLevelEnum("difficulty").notNull(),
    confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
    validationStatus: validationStatusEnum("validation_status")
      .notNull()
      .default("pending"),
    generatedBy: questionOriginEnum("generated_by").notNull(),
    tags: jsonb("tags"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_question_competency").on(table.competencyId),
    index("idx_question_difficulty").on(table.difficulty),
    index("idx_question_validation").on(table.validationStatus),
  ]
);

export const assessmentAttempts = pgTable(
  "assessment_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learnerProfiles.id, { onDelete: "cascade" }),
    questionIds: jsonb("question_ids").notNull(),
    answers: jsonb("answers").notNull(),
    score: decimal("score", { precision: 5, scale: 2 }),
    totalQuestions: integer("total_questions").notNull(),
    correctAnswers: integer("correct_answers"),
    timeSpentSeconds: integer("time_spent_seconds"),
    completedAt: timestamp("completed_at").defaultNow().notNull(),
  },
  (table) => [index("idx_attempt_learner").on(table.learnerId)]
);

// ============================================================
// iGOT INTEGRATION
// ============================================================

export const igotCourses = pgTable(
  "igot_courses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    igotCourseId: text("igot_course_id").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    domain: text("domain"),
    competencies: jsonb("competencies"),
    durationHours: decimal("duration_hours", { precision: 5, scale: 1 }),
    difficulty: text("difficulty"),
    language: text("language"),
    thumbnailUrl: text("thumbnail_url"),
    enrollUrl: text("enroll_url"),
    lastSyncedAt: timestamp("last_synced_at").notNull(),
    rawData: jsonb("raw_data"),
  },
  (table) => [
    index("idx_igot_domain").on(table.domain),
    index("idx_igot_difficulty").on(table.difficulty),
  ]
);

export const tpacProgrammes = pgTable(
  "tpac_programmes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programmeId: text("programme_id").notNull().unique(),
    title: text("title").notNull(),
    description: text("description"),
    competencies: jsonb("competencies"),
    durationDays: integer("duration_days"),
    startDate: timestamp("start_date"),
    endDate: timestamp("end_date"),
    venue: text("venue"),
    lastSyncedAt: timestamp("last_synced_at").notNull(),
    rawData: jsonb("raw_data"),
  },
  (table) => [index("idx_tpac_competencies").on(table.competencies)]
);

export const syncLogs = pgTable("sync_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  syncType: syncTypeEnum("sync_type").notNull(),
  source: text("source").notNull(), // 'igot' or 'tpac'
  status: syncStatusEnum("status").notNull(),
  recordsSynced: integer("records_synced").default(0),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  errorDetails: jsonb("error_details"),
});

// ============================================================
// CONTENT & DOCUMENTS
// ============================================================

export const uploadedContent = pgTable(
  "uploaded_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fileName: text("file_name").notNull(),
    fileType: text("file_type").notNull(),
    fileSize: integer("file_size").notNull(),
    storagePath: text("storage_path").notNull(),
    extractedText: text("extracted_text"),
    embeddingVector: text("embedding_vector"), // pgvector compatible
    uploadedBy: uuid("uploaded_by").references(() => learnerProfiles.id),
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_content_uploader").on(table.uploadedBy)]
);

// ============================================================
// ANALYTICS & EVENTS
// ============================================================

export const learningEvents = pgTable(
  "learning_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    learnerId: uuid("learner_id")
      .notNull()
      .references(() => learnerProfiles.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(), // 'course_started', 'assessment_completed', etc.
    eventData: jsonb("event_data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_event_learner").on(table.learnerId),
    index("idx_event_type").on(table.eventType),
    index("idx_event_created").on(table.createdAt),
  ]
);

// ============================================================
// RELATIONS
// ============================================================

export const usersRelations = relations(users, ({ one }) => ({
  profile: one(learnerProfiles, {
    fields: [users.id],
    references: [learnerProfiles.userId],
  }),
}));

export const learnerProfilesRelations = relations(
  learnerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [learnerProfiles.userId],
      references: [users.id],
    }),
    assessments: many(competencyAssessments),
    skillGaps: many(skillGaps),
    learningPaths: many(learningPaths),
    events: many(learningEvents),
  })
);

export const competenciesRelations = relations(competencies, ({ many }) => ({
  outgoingEdges: many(competencyEdges, { relationName: "source" }),
  incomingEdges: many(competencyEdges, { relationName: "target" }),
  assessments: many(competencyAssessments),
  roleRequirements: many(roleRequirements),
  questions: many(questionBank),
}));

export const competencyEdgesRelations = relations(
  competencyEdges,
  ({ one }) => ({
    source: one(competencies, {
      fields: [competencyEdges.sourceId],
      references: [competencies.id],
      relationName: "source",
    }),
    target: one(competencies, {
      fields: [competencyEdges.targetId],
      references: [competencies.id],
      relationName: "target",
    }),
  })
);

export const learningPathsRelations = relations(learningPaths, ({ one, many }) => ({
  learner: one(learnerProfiles, {
    fields: [learningPaths.learnerId],
    references: [learnerProfiles.id],
  }),
  nodes: many(learningPathNodes),
}));

export const learningPathNodesRelations = relations(
  learningPathNodes,
  ({ one }) => ({
    path: one(learningPaths, {
      fields: [learningPathNodes.pathId],
      references: [learningPaths.id],
    }),
    competency: one(competencies, {
      fields: [learningPathNodes.competencyId],
      references: [competencies.id],
    }),
  })
);
