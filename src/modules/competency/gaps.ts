import { db } from "../core/db";
import {
  skillGaps,
  competencyAssessments,
  roleRequirements,
  learnerProfiles,
  competencies,
} from "../core/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { buildCompetencyGraph, calculateGapSize, type CompetencyGraph } from "./graph";

// ============================================================
// TYPES
// ============================================================

export interface SkillGapResult {
  competencyId: string;
  competencyName: string;
  domain: string;
  currentLevel: string;
  targetLevel: string;
  gapSize: number;
  priority: "critical" | "high" | "medium" | "low";
}

export interface GapAnalysisResult {
  learnerId: string;
  gaps: SkillGapResult[];
  summary: {
    totalGaps: number;
    criticalGaps: number;
    highGaps: number;
    mediumGaps: number;
    lowGaps: number;
    domainBreakdown: Record<string, number>;
  };
}

// ============================================================
// GAP ANALYSIS
// ============================================================

/**
 * Perform comprehensive skill gap analysis for a learner
 */
export async function analyzeSkillGaps(learnerId: string): Promise<GapAnalysisResult> {
  // 1. Get learner profile
  const [learner] = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.id, learnerId))
    .limit(1);

  if (!learner) {
    throw new Error(`Learner not found: ${learnerId}`);
  }

  // 2. Get current assessments
  const assessments = await db
    .select()
    .from(competencyAssessments)
    .where(eq(competencyAssessments.learnerId, learnerId));

  // 3. Get role requirements
  const requirements = await db
    .select()
    .from(roleRequirements)
    .where(
      and(
        eq(roleRequirements.department, learner.department || ""),
        learner.jobRole ? eq(roleRequirements.roleName, learner.jobRole) : undefined
      )
    );

  // If no specific role requirements, get all requirements for the department
  let allRequirements = requirements;
  if (requirements.length === 0) {
    allRequirements = await db
      .select()
      .from(roleRequirements)
      .where(eq(roleRequirements.department, learner.department || ""));
  }

  // 4. Build lookup maps
  const assessmentMap = new Map(
    assessments.map((a) => [a.competencyId, a.currentLevel])
  );

  // 5. Calculate gaps
  const gaps: SkillGapResult[] = [];

  // Get competency details for all required competencies
  const requiredCompetencyIds = allRequirements.map((r) => r.competencyId);
  if (requiredCompetencyIds.length === 0) {
    return {
      learnerId,
      gaps: [],
      summary: {
        totalGaps: 0,
        criticalGaps: 0,
        highGaps: 0,
        mediumGaps: 0,
        lowGaps: 0,
        domainBreakdown: {},
      },
    };
  }

  const requiredCompetencies = await db
    .select()
    .from(competencies)
    .where(inArray(competencies.id, requiredCompetencyIds));

  const competencyMap = new Map(
    requiredCompetencies.map((c) => [c.id, c])
  );

  // 6. Compute gaps for each requirement
  for (const req of allRequirements) {
    const competency = competencyMap.get(req.competencyId);
    if (!competency) continue;

    const currentLevel = assessmentMap.get(req.competencyId) || "none";
    const targetLevel = req.requiredLevel;
    const gapSize = calculateGapSize(currentLevel, targetLevel);

    if (gapSize > 0) {
      const priority = determinePriority(gapSize, req.priority);

      gaps.push({
        competencyId: req.competencyId,
        competencyName: competency.name,
        domain: competency.domain,
        currentLevel,
        targetLevel,
        gapSize,
        priority,
      });
    }
  }

  // 7. Sort by priority and gap size
  gaps.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return b.gapSize - a.gapSize;
  });

  // 8. Build summary
  const summary = {
    totalGaps: gaps.length,
    criticalGaps: gaps.filter((g) => g.priority === "critical").length,
    highGaps: gaps.filter((g) => g.priority === "high").length,
    mediumGaps: gaps.filter((g) => g.priority === "medium").length,
    lowGaps: gaps.filter((g) => g.priority === "low").length,
    domainBreakdown: {} as Record<string, number>,
  };

  // Calculate domain breakdown
  for (const gap of gaps) {
    summary.domainBreakdown[gap.domain] =
      (summary.domainBreakdown[gap.domain] || 0) + 1;
  }

  return { learnerId, gaps, summary };
}

/**
 * Determine gap priority based on gap size and requirement priority
 */
function determinePriority(
  gapSize: number,
  requirementPriority: string
): "critical" | "high" | "medium" | "low" {
  // Large gaps (3+ levels) are always critical
  if (gapSize >= 3) return "critical";

  // Medium gaps (2 levels) depend on requirement priority
  if (gapSize === 2) {
    if (requirementPriority === "critical") return "critical";
    return "high";
  }

  // Small gaps (1 level)
  if (gapSize === 1) {
    if (requirementPriority === "critical") return "high";
    if (requirementPriority === "high") return "medium";
    return "low";
  }

  return "low";
}

/**
 * Get department-wide skill gaps (for admin dashboard)
 */
export async function getDepartmentGaps(
  department: string
): Promise<GapAnalysisResult[]> {
  // Get all learners in department
  const learners = await db
    .select()
    .from(learnerProfiles)
    .where(eq(learnerProfiles.department, department));

  // Analyze gaps for each learner
  const results: GapAnalysisResult[] = [];

  for (const learner of learners) {
    try {
      const result = await analyzeSkillGaps(learner.id);
      results.push(result);
    } catch (error) {
      console.error(
        `Failed to analyze gaps for learner ${learner.id}:`,
        error
      );
    }
  }

  return results;
}

/**
 * Get aggregate skill gaps for the organization
 */
export async function getOrganizationGaps(): Promise<{
  totalOfficials: number;
  avgCompetencyScore: number;
  topGaps: { competencyName: string; gapCount: number; domain: string }[];
  departmentBreakdown: Record<string, { total: number; avgScore: number }>;
}> {
  // Get all learners
  const allLearners = await db.select().from(learnerProfiles);

  // Get all assessments
  const allAssessments = await db.select().from(competencyAssessments);

  // Build assessment lookup
  const assessmentMap = new Map<string, Map<string, string>>();
  for (const assessment of allAssessments) {
    const learnerAssessments = assessmentMap.get(assessment.learnerId) || new Map();
    learnerAssessments.set(assessment.competencyId, assessment.currentLevel);
    assessmentMap.set(assessment.learnerId, learnerAssessments);
  }

  // Calculate scores
  const levelScores = { none: 0, beginner: 25, intermediate: 50, advanced: 75, expert: 100 };
  let totalScore = 0;
  let assessmentCount = 0;
  const departmentScores: Record<string, { total: number; count: number }> = {};

  for (const learner of allLearners) {
    const learnerAssessments = assessmentMap.get(learner.id);
    if (!learnerAssessments) continue;

    for (const [, level] of learnerAssessments) {
      const score = levelScores[level as keyof typeof levelScores] || 0;
      totalScore += score;
      assessmentCount++;

      // Track by department
      if (learner.department) {
        const dept = departmentScores[learner.department] || { total: 0, count: 0 };
        dept.total += score;
        dept.count++;
        departmentScores[learner.department] = dept;
      }
    }
  }

  const avgScore = assessmentCount > 0 ? Math.round(totalScore / assessmentCount) : 0;

  // Department breakdown
  const departmentBreakdown: Record<string, { total: number; avgScore: number }> = {};
  for (const [dept, data] of Object.entries(departmentScores)) {
    departmentBreakdown[dept] = {
      total: data.count,
      avgScore: data.count > 0 ? Math.round(data.total / data.count) : 0,
    };
  }

  // Find top gaps (competencies with most people below intermediate)
  const competencyGapCounts = new Map<string, { name: string; domain: string; count: number }>();
  for (const [, assessments] of assessmentMap) {
    for (const [compId, level] of assessments) {
      if (level === "none" || level === "beginner") {
        const existing = competencyGapCounts.get(compId) || { name: "", domain: "", count: 0 };
        existing.count++;
        competencyGapCounts.set(compId, existing);
      }
    }
  }

  // Get competency names
  const allCompetencies = await db.select().from(competencies);
  const competencyLookup = new Map(allCompetencies.map((c) => [c.id, c]));

  const topGaps = Array.from(competencyGapCounts.entries())
    .map(([id, data]) => {
      const comp = competencyLookup.get(id);
      return {
        competencyName: comp?.name || "Unknown",
        gapCount: data.count,
        domain: comp?.domain || "unknown",
      };
    })
    .sort((a, b) => b.gapCount - a.gapCount)
    .slice(0, 10);

  return {
    totalOfficials: allLearners.length,
    avgCompetencyScore: avgScore,
    topGaps,
    departmentBreakdown,
  };
}

/**
 * Save skill gaps to database
 */
export async function saveSkillGaps(learnerId: string, gaps: SkillGapResult[]) {
  // Delete existing gaps for this learner
  await db.delete(skillGaps).where(eq(skillGaps.learnerId, learnerId));

  // Insert new gaps
  if (gaps.length > 0) {
    await db.insert(skillGaps).values(
      gaps.map((gap) => ({
        learnerId,
        competencyId: gap.competencyId,
        currentLevel: gap.currentLevel as any,
        targetLevel: gap.targetLevel as any,
        gapSize: gap.gapSize,
        priority: gap.priority,
      }))
    );
  }

  return gaps.length;
}
