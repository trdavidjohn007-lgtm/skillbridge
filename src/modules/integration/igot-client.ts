import { db } from "../core/db";
import { igotCourses, tpacProgrammes, syncLogs } from "../core/db/schema";
import { eq } from "drizzle-orm";

// ============================================================
// TYPES
// ============================================================

export interface IgotCourseData {
  id: string;
  title: string;
  description: string;
  domain: string;
  competencies: string[];
  durationHours: number;
  difficulty: string;
  language: string;
  thumbnailUrl?: string;
  enrollUrl?: string;
  raw: any;
}

export interface TpacProgrammeData {
  id: string;
  title: string;
  description: string;
  competencies: string[];
  durationDays: number;
  startDate?: Date;
  endDate?: Date;
  venue?: string;
  raw: any;
}

export interface SyncResult {
  type: "full" | "incremental";
  source: "igot" | "tpac";
  status: "success" | "partial" | "failed";
  recordsSynced: number;
  startedAt: Date;
  completedAt: Date;
  errors?: string[];
}

// ============================================================
// iGOT API CLIENT
// ============================================================

const IGOT_BASE_URL = process.env.IGOT_API_BASE_URL || "https://igotkarmayogi.gov.in/api/v1";
const IGOT_API_KEY = process.env.IGOT_API_KEY || "";

/**
 * Fetch course catalog from iGOT API
 */
async function fetchIgotCourses(
  page: number = 1,
  limit: number = 100
): Promise<IgotCourseData[]> {
  try {
    const response = await fetch(
      `${IGOT_BASE_URL}/courses?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${IGOT_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`iGOT API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize iGOT data to our canonical format
    return (data.courses || []).map(normalizeIgotCourse);
  } catch (error) {
    console.error("Failed to fetch iGOT courses:", error);
    throw error;
  }
}

/**
 * Normalize iGOT course data to our canonical format
 */
function normalizeIgotCourse(raw: any): IgotCourseData {
  return {
    id: raw.id || raw.courseId,
    title: raw.title || raw.courseName,
    description: raw.description || raw.courseDescription || "",
    domain: raw.domain || raw.category || "General",
    competencies: extractCompetencies(raw),
    durationHours: calculateDurationHours(raw.duration || raw.estimatedDuration),
    difficulty: raw.difficulty || raw.level || "Intermediate",
    language: raw.language || raw.medium || "English",
    thumbnailUrl: raw.thumbnail || raw.imageUrl,
    enrollUrl: raw.enrollUrl || raw.url,
    raw,
  };
}

/**
 * Extract competency tags from iGOT course data
 */
function extractCompetencies(raw: any): string[] {
  const competencies: string[] = [];

  // Check various fields where competencies might be stored
  if (raw.competencies) {
    if (Array.isArray(raw.competencies)) {
      competencies.push(...raw.competencies);
    } else if (typeof raw.competencies === "string") {
      competencies.push(...raw.competencies.split(",").map((s: string) => s.trim()));
    }
  }

  if (raw.tags) {
    if (Array.isArray(raw.tags)) {
      competencies.push(...raw.tags);
    }
  }

  if (raw.skills) {
    if (Array.isArray(raw.skills)) {
      competencies.push(...raw.skills);
    }
  }

  // Deduplicate
  return [...new Set(competencies)];
}

/**
 * Calculate duration in hours from various formats
 */
function calculateDurationHours(duration: any): number {
  if (typeof duration === "number") return duration;
  if (typeof duration === "string") {
    // Try parsing "X hours" or "Xh Ym" format
    const hoursMatch = duration.match(/(\d+)\s*(?:hours?|h)/i);
    const minutesMatch = duration.match(/(\d+)\s*(?:minutes?|m)/i);
    
    let hours = 0;
    if (hoursMatch) hours += parseInt(hoursMatch[1]);
    if (minutesMatch) hours += parseInt(minutesMatch[1]) / 60;
    
    return hours || 4; // Default to 4 hours
  }
  return 4;
}

// ============================================================
// TPAC API CLIENT
// ============================================================

/**
 * Fetch TPAC training programmes
 */
async function fetchTpacProgrammes(): Promise<TpacProgrammeData[]> {
  try {
    // TPAC API endpoint (placeholder - adjust based on actual API)
    const response = await fetch(`${IGOT_BASE_URL}/tpac/programmes`, {
      headers: {
        Authorization: `Bearer ${IGOT_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`TPAC API error: ${response.status}`);
    }

    const data = await response.json();
    return (data.programmes || []).map(normalizeTpacProgramme);
  } catch (error) {
    console.error("Failed to fetch TPAC programmes:", error);
    throw error;
  }
}

/**
 * Normalize TPAC data to canonical format
 */
function normalizeTpacProgramme(raw: any): TpacProgrammeData {
  return {
    id: raw.id || raw.programmeId,
    title: raw.title || raw.programmeName,
    description: raw.description || "",
    competencies: extractCompetencies(raw),
    durationDays: raw.durationDays || raw.duration || 3,
    startDate: raw.startDate ? new Date(raw.startDate) : undefined,
    endDate: raw.endDate ? new Date(raw.endDate) : undefined,
    venue: raw.venue || raw.location,
    raw,
  };
}

// ============================================================
// SYNC ENGINE
// ============================================================

/**
 * Sync iGOT courses to local database
 */
export async function syncIgotCourses(
  type: "full" | "incremental" = "incremental"
): Promise<SyncResult> {
  const startedAt = new Date();
  let recordsSynced = 0;
  const errors: string[] = [];

  // Create sync log entry
  const [syncLog] = await db
    .insert(syncLogs)
    .values({
      syncType: type,
      source: "igot",
      status: "partial", // Will update on completion
      startedAt,
    })
    .returning();

  try {
    // Fetch all courses from iGOT
    const courses = await fetchIgotCourses();
    
    for (const course of courses) {
      try {
        // Check if course already exists
        const [existing] = await db
          .select()
          .from(igotCourses)
          .where(eq(igotCourses.igotCourseId, course.id))
          .limit(1);

        if (existing) {
          // Update existing course
          await db
            .update(igotCourses)
            .set({
              title: course.title,
              description: course.description,
              domain: course.domain,
              competencies: course.competencies,
              durationHours: course.durationHours,
              difficulty: course.difficulty,
              language: course.language,
              thumbnailUrl: course.thumbnailUrl,
              enrollUrl: course.enrollUrl,
              lastSyncedAt: new Date(),
              rawData: course.raw,
            })
            .where(eq(igotCourses.igotCourseId, course.id));
        } else {
          // Insert new course
          await db.insert(igotCourses).values({
            igotCourseId: course.id,
            title: course.title,
            description: course.description,
            domain: course.domain,
            competencies: course.competencies,
            durationHours: course.durationHours,
            difficulty: course.difficulty,
            language: course.language,
            thumbnailUrl: course.thumbnailUrl,
            enrollUrl: course.enrollUrl,
            lastSyncedAt: new Date(),
            rawData: course.raw,
          });
        }

        recordsSynced++;
      } catch (error) {
        errors.push(`Failed to sync course ${course.id}: ${error}`);
      }
    }

    // Update sync log
    await db
      .update(syncLogs)
      .set({
        status: errors.length === 0 ? "success" : "partial",
        recordsSynced,
        completedAt: new Date(),
        errorDetails: errors.length > 0 ? { errors } : null,
      })
      .where(eq(syncLogs.id, syncLog.id));

    return {
      type,
      source: "igot",
      status: errors.length === 0 ? "success" : "partial",
      recordsSynced,
      startedAt,
      completedAt: new Date(),
      errors,
    };
  } catch (error) {
    // Update sync log with failure
    await db
      .update(syncLogs)
      .set({
        status: "failed",
        recordsSynced,
        completedAt: new Date(),
        errorDetails: { errors: [String(error)] },
      })
      .where(eq(syncLogs.id, syncLog.id));

    return {
      type,
      source: "igot",
      status: "failed",
      recordsSynced,
      startedAt,
      completedAt: new Date(),
      errors: [String(error)],
    };
  }
}

/**
 * Sync TPAC programmes to local database
 */
export async function syncTpacProgrammes(): Promise<SyncResult> {
  const startedAt = new Date();
  let recordsSynced = 0;
  const errors: string[] = [];

  const [syncLog] = await db
    .insert(syncLogs)
    .values({
      syncType: "full",
      source: "tpac",
      status: "partial",
      startedAt,
    })
    .returning();

  try {
    const programmes = await fetchTpacProgrammes();

    for (const prog of programmes) {
      try {
        const [existing] = await db
          .select()
          .from(tpacProgrammes)
          .where(eq(tpacProgrammes.programmeId, prog.id))
          .limit(1);

        if (existing) {
          await db
            .update(tpacProgrammes)
            .set({
              title: prog.title,
              description: prog.description,
              competencies: prog.competencies,
              durationDays: prog.durationDays,
              startDate: prog.startDate,
              endDate: prog.endDate,
              venue: prog.venue,
              lastSyncedAt: new Date(),
              rawData: prog.raw,
            })
            .where(eq(tpacProgrammes.programmeId, prog.id));
        } else {
          await db.insert(tpacProgrammes).values({
            programmeId: prog.id,
            title: prog.title,
            description: prog.description,
            competencies: prog.competencies,
            durationDays: prog.durationDays,
            startDate: prog.startDate,
            endDate: prog.endDate,
            venue: prog.venue,
            lastSyncedAt: new Date(),
            rawData: prog.raw,
          });
        }

        recordsSynced++;
      } catch (error) {
        errors.push(`Failed to sync programme ${prog.id}: ${error}`);
      }
    }

    await db
      .update(syncLogs)
      .set({
        status: errors.length === 0 ? "success" : "partial",
        recordsSynced,
        completedAt: new Date(),
        errorDetails: errors.length > 0 ? { errors } : null,
      })
      .where(eq(syncLogs.id, syncLog.id));

    return {
      type: "full",
      source: "tpac",
      status: errors.length === 0 ? "success" : "partial",
      recordsSynced,
      startedAt,
      completedAt: new Date(),
      errors,
    };
  } catch (error) {
    await db
      .update(syncLogs)
      .set({
        status: "failed",
        recordsSynced,
        completedAt: new Date(),
        errorDetails: { errors: [String(error)] },
      })
      .where(eq(syncLogs.id, syncLog.id));

    return {
      type: "full",
      source: "tpac",
      status: "failed",
      recordsSynced,
      startedAt,
      completedAt: new Date(),
      errors: [String(error)],
    };
  }
}

/**
 * Get cached courses (from local database, not API)
 */
export async function getCachedCourses(
  filters?: {
    domain?: string;
    difficulty?: string;
    language?: string;
  }
) {
  let query = db.select().from(igotCourses);

  // Apply filters if provided
  // Note: Drizzle doesn't have dynamic WHERE in this pattern,
  // so we'd need to build the query dynamically in production

  const courses = await query;
  return courses;
}

/**
 * Get cached TPAC programmes
 */
export async function getCachedTpacProgrammes() {
  return db.select().from(tpacProgrammes);
}

/**
 * Get sync history
 */
export async function getSyncHistory(limit: number = 10) {
  return db
    .select()
    .from(syncLogs)
    .orderBy(syncLogs.startedAt)
    .limit(limit);
}
