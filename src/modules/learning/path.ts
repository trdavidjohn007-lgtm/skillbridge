import { db } from "../core/db";
import {
  learningPaths,
  learningPathNodes,
  skillGaps,
  igotCourses,
  tpacProgrammes,
  competencies,
  competencyAssessments,
  learnerProfiles,
} from "../core/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import {
  buildCompetencyGraph,
  getPrerequisiteChain,
  topologicalSort,
  type CompetencyGraph,
  type CompetencyNode,
} from "../competency/graph";
import type { SkillGapResult } from "../competency/gaps";

// ============================================================
// TYPES
// ============================================================

export interface LearningPathNode {
  competencyId: string;
  competencyName: string;
  domain: string;
  source: "igot" | "tpac";
  courseId: string;
  courseTitle: string;
  estimatedHours: number;
  order: number;
  status: "recommended" | "enrolled" | "in_progress" | "completed";
}

export interface LearningPathResult {
  id: string;
  name: string;
  status: string;
  nodes: LearningPathNode[];
  totalEstimatedHours: number;
  completionPercentage: number;
}

// ============================================================
// LEARNING PATH GENERATION
// ============================================================

/**
 * Generate a personalized learning path for a learner based on skill gaps
 */
export async function generateLearningPath(
  learnerId: string,
  gaps: SkillGapResult[]
): Promise<LearningPathResult> {
  // 1. Build competency graph
  const graph = await buildCompetencyGraph();

  // 2. Get topological order (dependency order)
  const topoOrder = topologicalSort(graph);

  // 3. For each gap, get prerequisite chain
  const allRequiredCompetencies: {
    competencyId: string;
    competencyName: string;
    domain: string;
    priority: "critical" | "high" | "medium" | "low";
    isGap: boolean;
  }[] = [];

  const processedIds = new Set<string>();

  for (const gap of gaps) {
    // Add the gap competency itself
    if (!processedIds.has(gap.competencyId)) {
      allRequiredCompetencies.push({
        competencyId: gap.competencyId,
        competencyName: gap.competencyName,
        domain: gap.domain,
        priority: gap.priority,
        isGap: true,
      });
      processedIds.add(gap.competencyId);
    }

    // Get prerequisites
    const prerequisites = getPrerequisiteChain(graph, gap.competencyId);
    for (const prereq of prerequisites) {
      if (!processedIds.has(prereq.id)) {
        // Check if learner already has this prerequisite
        const existingAssessment = await db
          .select()
          .from(competencyAssessments)
          .where(
            and(
              eq(competencyAssessments.learnerId, learnerId),
              eq(competencyAssessments.competencyId, prereq.id)
            )
          )
          .limit(1);

        // Only add if not already at required level
        if (existingAssessment.length === 0 || 
            existingAssessment[0].currentLevel === "none") {
          allRequiredCompetencies.push({
            competencyId: prereq.id,
            competencyName: prereq.name,
            domain: prereq.domain,
            priority: "medium",
            isGap: false,
          });
          processedIds.add(prereq.id);
        }
      }
    }
  }

  // 4. Sort by topological order (dependencies first)
  allRequiredCompetencies.sort((a, b) => {
    const aIndex = topoOrder.indexOf(a.competencyId);
    const bIndex = topoOrder.indexOf(b.competencyId);
    return aIndex - bIndex;
  });

  // 5. Match each competency to courses
  const pathNodes: LearningPathNode[] = [];
  let order = 1;

  for (const required of allRequiredCompetencies) {
    // Try to find matching iGOT course
    const igotMatch = await findMatchingIgotCourse(required.competencyId, required.domain);
    
    // Try to find matching TPAC programme
    const tpacMatch = await findMatchingTpacProgramme(required.competencyId);

    if (igotMatch) {
      pathNodes.push({
        competencyId: required.competencyId,
        competencyName: required.competencyName,
        domain: required.domain,
        source: "igot",
        courseId: igotMatch.igotCourseId,
        courseTitle: igotMatch.title,
        estimatedHours: parseFloat(igotMatch.durationHours?.toString() || "4"),
        order: order++,
        status: "recommended",
      });
    } else if (tpacMatch) {
      pathNodes.push({
        competencyId: required.competencyId,
        competencyName: required.competencyName,
        domain: required.domain,
        source: "tpac",
        courseId: tpacMatch.programmeId,
        courseTitle: tpacMatch.title,
        estimatedHours: (tpacMatch.durationDays || 1) * 8, // Convert days to hours
        order: order++,
        status: "recommended",
      });
    } else {
      // No matching course found - still add to path for tracking
      pathNodes.push({
        competencyId: required.competencyId,
        competencyName: required.competencyName,
        domain: required.domain,
        source: "igot",
        courseId: "",
        courseTitle: `Recommended: ${required.competencyName} (No course available)`,
        estimatedHours: 4,
        order: order++,
        status: "recommended",
      });
    }
  }

  // 6. Create learning path in database
  const totalHours = pathNodes.reduce((sum, node) => sum + node.estimatedHours, 0);

  const [path] = await db
    .insert(learningPaths)
    .values({
      learnerId,
      name: `Personalized Learning Path - ${new Date().toLocaleDateString()}`,
      description: `Generated based on ${gaps.length} skill gaps`,
      status: "active",
    })
    .returning();

  // 7. Insert path nodes
  for (const node of pathNodes) {
    await db.insert(learningPathNodes).values({
      pathId: path.id,
      competencyId: node.competencyId,
      courseId: node.courseId || null,
      source: node.source,
      displayOrder: node.order,
      status: "recommended",
      estimatedHours: node.estimatedHours.toString(),
    });
  }

  return {
    id: path.id,
    name: path.name,
    status: path.status,
    nodes: pathNodes,
    totalEstimatedHours: totalHours,
    completionPercentage: 0,
  };
}

/**
 * Find matching iGOT course for a competency
 */
async function findMatchingIgotCourse(
  competencyId: string,
  domain: string
) {
  // Get competency name for matching
  const [competency] = await db
    .select()
    .from(competencies)
    .where(eq(competencies.id, competencyId))
    .limit(1);

  if (!competency) return null;

  // Search for courses that mention this competency
  const courses = await db
    .select()
    .from(igotCourses)
    .where(
      and(
        // Match by domain or competency name in title/description
        // This is a simplified matching - in production, use semantic search
      )
    );

  // Simple keyword matching
  for (const course of courses) {
    const titleLower = course.title.toLowerCase();
    const descLower = course.description?.toLowerCase() || "";
    const compNameLower = competency.name.toLowerCase();

    if (
      titleLower.includes(compNameLower) ||
      descLower.includes(compNameLower) ||
      (course.competencies as string[])?.includes(competency.name)
    ) {
      return course;
    }
  }

  return null;
}

/**
 * Find matching TPAC programme for a competency
 */
async function findMatchingTpacProgramme(competencyId: string) {
  const [competency] = await db
    .select()
    .from(competencies)
    .where(eq(competencies.id, competencyId))
    .limit(1);

  if (!competency) return null;

  const programmes = await db.select().from(tpacProgrammes);

  for (const prog of programmes) {
    const titleLower = prog.title.toLowerCase();
    const descLower = prog.description?.toLowerCase() || "";
    const compNameLower = competency.name.toLowerCase();

    if (
      titleLower.includes(compNameLower) ||
      descLower.includes(compNameLower) ||
      (prog.competencies as string[])?.includes(competency.name)
    ) {
      return prog;
    }
  }

  return null;
}

/**
 * Get learner's active learning paths
 */
export async function getLearnerPaths(learnerId: string): Promise<LearningPathResult[]> {
  const paths = await db
    .select()
    .from(learningPaths)
    .where(
      and(
        eq(learningPaths.learnerId, learnerId),
        eq(learningPaths.status, "active")
      )
    );

  const results: LearningPathResult[] = [];

  for (const path of paths) {
    const nodes = await db
      .select()
      .from(learningPathNodes)
      .where(eq(learningPathNodes.pathId, path.id))
      .orderBy(learningPathNodes.displayOrder);

    // Get competency details
    const competencyIds = nodes.map((n) => n.competencyId);
    const competencyDetails = await db
      .select()
      .from(competencies)
      .where(inArray(competencies.id, competencyIds));

    const competencyMap = new Map(competencyDetails.map((c) => [c.id, c]));

    const pathNodes: LearningPathNode[] = nodes.map((node) => {
      const comp = competencyMap.get(node.competencyId);
      return {
        competencyId: node.competencyId,
        competencyName: comp?.name || "Unknown",
        domain: comp?.domain || "unknown",
        source: node.source as "igot" | "tpac",
        courseId: node.courseId || "",
        courseTitle: `Course for ${comp?.name || "Unknown"}`,
        estimatedHours: parseFloat(node.estimatedHours?.toString() || "4"),
        order: node.displayOrder,
        status: node.status as any,
      };
    });

    const totalHours = pathNodes.reduce((sum, n) => sum + n.estimatedHours, 0);
    const completedNodes = pathNodes.filter((n) => n.status === "completed").length;
    const completionPct =
      pathNodes.length > 0
        ? Math.round((completedNodes / pathNodes.length) * 100)
        : 0;

    results.push({
      id: path.id,
      name: path.name,
      status: path.status,
      nodes: pathNodes,
      totalEstimatedHours: totalHours,
      completionPercentage: completionPct,
    });
  }

  return results;
}

/**
 * Update node status in learning path
 */
export async function updateNodeStatus(
  nodeId: string,
  status: "recommended" | "enrolled" | "in_progress" | "completed"
) {
  const [updated] = await db
    .update(learningPathNodes)
    .set({
      status,
      completedAt: status === "completed" ? new Date() : null,
    })
    .where(eq(learningPathNodes.id, nodeId))
    .returning();

  return updated;
}

/**
 * Adapt learning path based on assessment performance
 * If a learner scores well on a prerequisite, skip beginner courses
 */
export async function adaptLearningPath(
  learnerId: string,
  pathId: string
) {
  // Get learner's current assessments
  const assessments = await db
    .select()
    .from(competencyAssessments)
    .where(eq(competencyAssessments.learnerId, learnerId));

  const assessmentMap = new Map(
    assessments.map((a) => [a.competencyId, a.currentLevel])
  );

  // Get path nodes
  const nodes = await db
    .select()
    .from(learningPathNodes)
    .where(eq(learningPathNodes.pathId, pathId));

  // Check each node - if learner already has the competency, mark as completed
  for (const node of nodes) {
    const currentLevel = assessmentMap.get(node.competencyId);
    if (currentLevel && currentLevel !== "none") {
      // Learner has some competency - check if it meets the target
      const [competency] = await db
        .select()
        .from(competencies)
        .where(eq(competencies.id, node.competencyId))
        .limit(1);

      if (competency) {
        const levelOrder = { none: 0, beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
        const current = levelOrder[currentLevel as keyof typeof levelOrder] || 0;
        const target = levelOrder[competency.level as keyof typeof levelOrder] || 0;

        if (current >= target) {
          await updateNodeStatus(node.id, "completed");
        }
      }
    }
  }

  // Return updated path
  const paths = await getLearnerPaths(learnerId);
  return paths.find((p) => p.id === pathId);
}
