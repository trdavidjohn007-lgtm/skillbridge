import { db } from "../core/db";
import {
  learnerProfiles,
  competencyAssessments,
  skillGaps,
  learningPaths,
  learningPathNodes,
  learningEvents,
  competencies,
} from "../core/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { buildCompetencyGraph, groupByDomain } from "../competency/graph";

// ============================================================
// TYPES
// ============================================================

export interface CompetencyRadarData {
  domain: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface SkillGapSummary {
  competencyId: string;
  competencyName: string;
  domain: string;
  currentLevel: string;
  targetLevel: string;
  gapSize: number;
  priority: string;
  estimatedHours: number;
}

export interface LearningProgress {
  pathId: string;
  pathName: string;
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  completionPercentage: number;
  totalEstimatedHours: number;
  completedHours: number;
}

export interface EmployeeDashboardData {
  learnerId: string;
  name: string;
  designation: string;
  department: string;
  competencyRadar: CompetencyRadarData[];
  topSkillGaps: SkillGapSummary[];
  learningPaths: LearningProgress[];
  overallProgress: {
    totalCompetencies: number;
    assessedCompetencies: number;
    averageScore: number;
    completionPercentage: number;
  };
  learningHours: {
    thisMonth: number;
    thisQuarter: number;
    thisYear: number;
  };
  recentActivity: {
    eventType: string;
    eventData: any;
    createdAt: Date;
  }[];
  aiSummary: string;
}

// ============================================================
// DASHBOARD DATA AGGREGATION
// ============================================================

/**
 * Get comprehensive employee dashboard data
 */
export async function getEmployeeDashboardData(
  learnerId: string
): Promise<EmployeeDashboardData> {
  // 1. Get learner profile
  const [learner] = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.id, learnerId))
    .limit(1);

  if (!learner) {
    throw new Error(`Learner not found: ${learnerId}`);
  }

  // 2. Get competency assessments
  const assessments = await db
    .select()
    .from(competencyAssessments)
    .where(eq(competencyAssessments.learnerId, learnerId));

  // 3. Get skill gaps
  const gaps = await db
    .select()
    .from(skillGaps)
    .where(eq(skillGaps.learnerId, learnerId));

  // 4. Get learning paths
  const paths = await db
    .select()
    .from(learningPaths)
    .where(
      and(
        eq(learningPaths.learnerId, learnerId),
        eq(learningPaths.status, "active")
      )
    );

  // 5. Get all competencies for radar calculation
  const allCompetencies = await db.select().from(competencies);

  // 6. Calculate competency radar by domain
  const competencyRadar = calculateCompetencyRadar(
    assessments,
    allCompetencies
  );

  // 7. Build skill gap summaries
  const topSkillGaps = await buildSkillGapSummaries(gaps);

  // 8. Calculate learning progress
  const learningProgress = await calculateLearningProgress(paths);

  // 9. Calculate overall progress
  const overallProgress = calculateOverallProgress(
    assessments,
    allCompetencies
  );

  // 10. Calculate learning hours
  const learningHours = await calculateLearningHours(learnerId);

  // 11. Get recent activity
  const recentActivity = await getRecentActivity(learnerId);

  // 12. Generate AI summary
  const aiSummary = generateAISummary(
    competencyRadar,
    topSkillGaps,
    learningProgress,
    overallProgress
  );

  return {
    learnerId,
    name: learner.designation || "Unknown",
    designation: learner.designation || "Unknown",
    department: learner.department || "Unknown",
    competencyRadar,
    topSkillGaps: topSkillGaps.slice(0, 5),
    learningPaths: learningProgress,
    overallProgress,
    learningHours,
    recentActivity: recentActivity.slice(0, 10),
    aiSummary,
  };
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculateCompetencyRadar(
  assessments: any[],
  allCompetencies: any[]
): CompetencyRadarData[] {
  const levelScores: Record<string, number> = {
    none: 0,
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };

  // Group competencies by domain
  const domainGroups = new Map<string, any[]>();
  for (const comp of allCompetencies) {
    const domainNodes = domainGroups.get(comp.domain) || [];
    domainNodes.push(comp);
    domainGroups.set(comp.domain, domainNodes);
  }

  // Calculate average score per domain
  const radar: CompetencyRadarData[] = [];

  for (const [domain, comps] of domainGroups) {
    let totalScore = 0;
    let assessedCount = 0;

    for (const comp of comps) {
      const assessment = assessments.find(
        (a) => a.competencyId === comp.id
      );
      if (assessment) {
        totalScore +=
          levelScores[assessment.currentLevel as keyof typeof levelScores] || 0;
        assessedCount++;
      }
    }

    const avgScore =
      assessedCount > 0 ? Math.round(totalScore / assessedCount) : 0;

    radar.push({
      domain,
      score: avgScore,
      maxScore: 100,
      percentage: avgScore,
    });
  }

  return radar;
}

async function buildSkillGapSummaries(gaps: any[]): Promise<SkillGapSummary[]> {
  const summaries: SkillGapSummary[] = [];

  for (const gap of gaps) {
    // Get competency details
    const [competency] = await db
      .select()
      .from(competencies)
      .where(eq(competencies.id, gap.competencyId))
      .limit(1);

    if (competency) {
      // Estimate hours based on gap size
      const estimatedHours = gap.gapSize * 8; // Rough estimate: 8 hours per level

      summaries.push({
        competencyId: gap.competencyId,
        competencyName: competency.name,
        domain: competency.domain,
        currentLevel: gap.currentLevel,
        targetLevel: gap.targetLevel,
        gapSize: gap.gapSize,
        priority: gap.priority,
        estimatedHours,
      });
    }
  }

  // Sort by priority
  const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  summaries.sort(
    (a, b) =>
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 0)
  );

  return summaries;
}

async function calculateLearningProgress(
  paths: any[]
): Promise<LearningProgress[]> {
  const progress: LearningProgress[] = [];

  for (const path of paths) {
    const nodes = await db
      .select()
      .from(learningPathNodes)
      .where(eq(learningPathNodes.pathId, path.id));

    const totalNodes = nodes.length;
    const completedNodes = nodes.filter(
      (n) => n.status === "completed"
    ).length;
    const inProgressNodes = nodes.filter(
      (n) => n.status === "in_progress"
    ).length;

    const completionPct =
      totalNodes > 0 ? Math.round((completedNodes / totalNodes) * 100) : 0;

    const totalHours = nodes.reduce(
      (sum, n) => sum + parseFloat(n.estimatedHours?.toString() || "0"),
      0
    );
    const completedHours = nodes
      .filter((n) => n.status === "completed")
      .reduce(
        (sum, n) => sum + parseFloat(n.estimatedHours?.toString() || "0"),
        0
      );

    progress.push({
      pathId: path.id,
      pathName: path.name,
      totalNodes,
      completedNodes,
      inProgressNodes,
      completionPercentage: completionPct,
      totalEstimatedHours: totalHours,
      completedHours,
    });
  }

  return progress;
}

function calculateOverallProgress(
  assessments: any[],
  allCompetencies: any[]
) {
  const levelScores: Record<string, number> = {
    none: 0,
    beginner: 25,
    intermediate: 50,
    advanced: 75,
    expert: 100,
  };

  let totalScore = 0;
  let assessedCount = 0;

  for (const assessment of assessments) {
    totalScore +=
      levelScores[assessment.currentLevel as keyof typeof levelScores] || 0;
    assessedCount++;
  }

  const avgScore =
    assessedCount > 0 ? Math.round(totalScore / assessedCount) : 0;

  return {
    totalCompetencies: allCompetencies.length,
    assessedCompetencies: assessedCount,
    averageScore: avgScore,
    completionPercentage: Math.round(
      (assessedCount / Math.max(allCompetencies.length, 1)) * 100
    ),
  };
}

async function calculateLearningHours(learnerId: string) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisQuarterStart = new Date(
    now.getFullYear(),
    Math.floor(now.getMonth() / 3) * 3,
    1
  );
  const thisYearStart = new Date(now.getFullYear(), 0, 1);

  // Get learning events
  const events = await db
    .select()
    .from(learningEvents)
    .where(eq(learningEvents.learnerId, learnerId));

  let thisMonth = 0;
  let thisQuarter = 0;
  let thisYear = 0;

  for (const event of events) {
    const eventDate = new Date(event.createdAt);
    const hours = (event.eventData as any)?.hours || 0;

    if (eventDate >= thisMonthStart) thisMonth += hours;
    if (eventDate >= thisQuarterStart) thisQuarter += hours;
    if (eventDate >= thisYearStart) thisYear += hours;
  }

  return { thisMonth, thisQuarter, thisYear };
}

async function getRecentActivity(learnerId: string) {
  return db
    .select()
    .from(learningEvents)
    .where(eq(learningEvents.learnerId, learnerId))
    .orderBy(learningEvents.createdAt)
    .limit(10);
}

// ============================================================
// AI SUMMARY GENERATION
// ============================================================

function generateAISummary(
  radar: CompetencyRadarData[],
  gaps: SkillGapSummary[],
  paths: LearningProgress[],
  overall: any
): string {
  const parts: string[] = [];

  // Competency overview
  const strongDomains = radar.filter((r) => r.percentage >= 70);
  const weakDomains = radar.filter((r) => r.percentage < 40);

  if (strongDomains.length > 0) {
    parts.push(
      `Your strengths are in ${strongDomains.map((d) => d.domain).join(", ")} (${strongDomains.map((d) => d.percentage).join("%, ")}%).`
    );
  }

  if (weakDomains.length > 0) {
    parts.push(
      `Focus areas: ${weakDomains.map((d) => d.domain).join(", ")} (${weakDomains.map((d) => d.percentage).join("%, ")}%).`
    );
  }

  // Top gaps
  if (gaps.length > 0) {
    const topGap = gaps[0];
    parts.push(
      `Your highest priority gap is ${topGap.competencyName} (${topGap.currentLevel} → ${topGap.targetLevel}).`
    );

    const totalHours = gaps.reduce((sum, g) => sum + g.estimatedHours, 0);
    parts.push(
      `Estimated ${totalHours} hours to close all ${gaps.length} identified gaps.`
    );
  }

  // Learning progress
  if (paths.length > 0) {
    const activePath = paths[0];
    parts.push(
      `You're ${activePath.completionPercentage}% through your learning path "${activePath.pathName}".`
    );
  }

  // Overall
  parts.push(
    `Overall: ${overall.assessedCompetencies}/${overall.totalCompetencies} competencies assessed, average score ${overall.averageScore}%.`
  );

  return parts.join(" ");
}
