import { db } from "../core/db";
import { competencies, competencyEdges } from "../core/db/schema";
import { eq, inArray, and } from "drizzle-orm";

// ============================================================
// TYPES
// ============================================================

export interface CompetencyNode {
  id: string;
  name: string;
  description: string | null;
  domain: string;
  level: string;
  frameworkVersion: string;
}

export interface CompetencyEdge {
  id: string;
  sourceId: string;
  targetId: string;
  relationship: "prerequisite" | "related" | "progression";
}

export interface CompetencyGraph {
  nodes: Map<string, CompetencyNode>;
  adjacencyList: Map<string, CompetencyEdge[]>;
  reverseAdjacency: Map<string, CompetencyEdge[]>;
}

// ============================================================
// GRAPH CONSTRUCTION
// ============================================================

/**
 * Build the full competency graph from the database
 */
export async function buildCompetencyGraph(): Promise<CompetencyGraph> {
  // Fetch all competencies
  const allCompetencies = await db
    .select()
    .from(competencies)
    .where(eq(competencies.isActive, "true"));

  // Fetch all edges
  const allEdges = await db.select().from(competencyEdges);

  // Build adjacency lists
  const nodes = new Map<string, CompetencyNode>();
  const adjacencyList = new Map<string, CompetencyEdge[]>();
  const reverseAdjacency = new Map<string, CompetencyEdge[]>();

  for (const comp of allCompetencies) {
    nodes.set(comp.id, {
      id: comp.id,
      name: comp.name,
      description: comp.description,
      domain: comp.domain,
      level: comp.level,
      frameworkVersion: comp.frameworkVersion,
    });
    adjacencyList.set(comp.id, []);
    reverseAdjacency.set(comp.id, []);
  }

  for (const edge of allEdges) {
    const sourceEdges = adjacencyList.get(edge.sourceId) || [];
    sourceEdges.push(edge);
    adjacencyList.set(edge.sourceId, sourceEdges);

    const targetEdges = reverseAdjacency.get(edge.targetId) || [];
    targetEdges.push(edge);
    reverseAdjacency.set(edge.targetId, targetEdges);
  }

  return { nodes, adjacencyList, reverseAdjacency };
}

// ============================================================
// TOPOLOGICAL SORT
// ============================================================

/**
 * Topological sort using Kahn's algorithm
 * Returns competencies in dependency order (prerequisites first)
 */
export function topologicalSort(graph: CompetencyGraph): string[] {
  const inDegree = new Map<string, number>();
  const queue: string[] = [];
  const result: string[] = [];

  // Initialize in-degrees
  for (const [nodeId] of graph.nodes) {
    inDegree.set(nodeId, 0);
  }

  // Count incoming prerequisite edges
  for (const [, edges] of graph.adjacencyList) {
    for (const edge of edges) {
      if (edge.relationship === "prerequisite") {
        const currentDegree = inDegree.get(edge.targetId) || 0;
        inDegree.set(edge.targetId, currentDegree + 1);
      }
    }
  }

  // Add nodes with no prerequisites to queue
  for (const [nodeId, degree] of inDegree) {
    if (degree === 0) {
      queue.push(nodeId);
    }
  }

  // Process queue
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    result.push(nodeId);

    const edges = graph.adjacencyList.get(nodeId) || [];
    for (const edge of edges) {
      if (edge.relationship === "prerequisite") {
        const currentDegree = inDegree.get(edge.targetId) || 0;
        inDegree.set(edge.targetId, currentDegree - 1);

        if (currentDegree - 1 === 0) {
          queue.push(edge.targetId);
        }
      }
    }
  }

  // Check for cycles
  if (result.length !== graph.nodes.size) {
    console.warn(
      "⚠️ Cycle detected in competency graph! Some nodes may not be reachable."
    );
  }

  return result;
}

// ============================================================
// PREREQUISITE CHAIN
// ============================================================

/**
 * Get all prerequisites for a given competency (transitive closure)
 * Uses BFS to find all ancestors through prerequisite edges
 */
export function getPrerequisiteChain(
  graph: CompetencyGraph,
  competencyId: string,
  maxDepth: number = 10
): CompetencyNode[] {
  const visited = new Set<string>();
  const result: CompetencyNode[] = [];
  const queue: { id: string; depth: number }[] = [{ id: competencyId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (visited.has(id) || depth > maxDepth) continue;
    visited.add(id);

    // Get incoming prerequisite edges (edges where this node is the target)
    const incomingEdges = graph.reverseAdjacency.get(id) || [];
    const prerequisiteEdges = incomingEdges.filter(
      (e) => e.relationship === "prerequisite"
    );

    for (const edge of prerequisiteEdges) {
      const prereqNode = graph.nodes.get(edge.sourceId);
      if (prereqNode && !visited.has(prereqNode.id)) {
        result.push(prereqNode);
        queue.push({ id: prereqNode.id, depth: depth + 1 });
      }
    }
  }

  return result;
}

/**
 * Get all competencies that depend on a given competency (dependents)
 */
export function getDependents(
  graph: CompetencyGraph,
  competencyId: string,
  maxDepth: number = 10
): CompetencyNode[] {
  const visited = new Set<string>();
  const result: CompetencyNode[] = [];
  const queue: { id: string; depth: number }[] = [{ id: competencyId, depth: 0 }];

  while (queue.length > 0) {
    const { id, depth } = queue.shift()!;

    if (visited.has(id) || depth > maxDepth) continue;
    visited.add(id);

    // Get outgoing prerequisite edges (edges where this node is the source)
    const outgoingEdges = graph.adjacencyList.get(id) || [];
    const dependentEdges = outgoingEdges.filter(
      (e) => e.relationship === "prerequisite"
    );

    for (const edge of dependentEdges) {
      const dependentNode = graph.nodes.get(edge.targetId);
      if (dependentNode && !visited.has(dependentNode.id)) {
        result.push(dependentNode);
        queue.push({ id: dependentNode.id, depth: depth + 1 });
      }
    }
  }

  return result;
}

// ============================================================
// SHORTEST PATH
// ============================================================

/**
 * Find shortest path between two competencies using BFS
 * Respects prerequisite relationship direction
 */
export function findShortestPath(
  graph: CompetencyGraph,
  fromId: string,
  toId: string
): CompetencyNode[] | null {
  if (fromId === toId) {
    const node = graph.nodes.get(fromId);
    return node ? [node] : null;
  }

  const visited = new Set<string>();
  const queue: { id: string; path: CompetencyNode[] }[] = [
    { id: fromId, path: [] },
  ];

  while (queue.length > 0) {
    const { id, path } = queue.shift()!;

    if (visited.has(id)) continue;
    visited.add(id);

    const node = graph.nodes.get(id);
    if (!node) continue;

    const newPath = [...path, node];

    // Check outgoing prerequisite edges
    const edges = graph.adjacencyList.get(id) || [];
    for (const edge of edges) {
      if (edge.relationship === "prerequisite") {
        if (edge.targetId === toId) {
          const targetNode = graph.nodes.get(toId);
          if (targetNode) return [...newPath, targetNode];
        }

        if (!visited.has(edge.targetId)) {
          queue.push({ id: edge.targetId, path: newPath });
        }
      }
    }
  }

  return null; // No path found
}

// ============================================================
// COMPETENCY DOMAIN GROUPING
// ============================================================

/**
 * Get all competencies grouped by domain
 */
export function groupByDomain(
  graph: CompetencyGraph
): Map<string, CompetencyNode[]> {
  const groups = new Map<string, CompetencyNode[]>();

  for (const [, node] of graph.nodes) {
    const domainNodes = groups.get(node.domain) || [];
    domainNodes.push(node);
    groups.set(node.domain, domainNodes);
  }

  return groups;
}

// ============================================================
// COMPETENCY LEVEL ORDERING
// ============================================================

const LEVEL_ORDER = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };

/**
 * Compare two competency levels
 * Returns negative if a < b, 0 if equal, positive if a > b
 */
export function compareLevels(a: string, b: string): number {
  return (LEVEL_ORDER[a as keyof typeof LEVEL_ORDER] || 0) - 
         (LEVEL_ORDER[b as keyof typeof LEVEL_ORDER] || 0);
}

/**
 * Calculate the gap size between two levels
 */
export function calculateGapSize(current: string, target: string): number {
  const currentLevel = LEVEL_ORDER[current as keyof typeof LEVEL_ORDER] || 0;
  const targetLevel = LEVEL_ORDER[target as keyof typeof LEVEL_ORDER] || 0;
  return Math.max(0, targetLevel - currentLevel);
}

/**
 * Get next level for a competency
 */
export function getNextLevel(currentLevel: string): string | null {
  const current = LEVEL_ORDER[currentLevel as keyof typeof LEVEL_ORDER];
  if (!current || current >= 4) return null;

  const levels = ["beginner", "intermediate", "advanced", "expert"];
  return levels[current] || null;
}

// ============================================================
// VALIDATION
// ============================================================

/**
 * Validate that the competency graph has no cycles
 * Uses DFS-based cycle detection
 */
export function validateGraph(graph: CompetencyGraph): {
  isValid: boolean;
  cycles: string[][];
} {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const cycles: string[][] = [];

  function dfs(
    nodeId: string,
    path: string[]
  ): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);

    const edges = graph.adjacencyList.get(nodeId) || [];
    for (const edge of edges) {
      if (edge.relationship === "prerequisite") {
        if (!visited.has(edge.targetId)) {
          if (dfs(edge.targetId, path)) return true;
        } else if (recursionStack.has(edge.targetId)) {
          // Found a cycle
          const cycleStart = path.indexOf(edge.targetId);
          const cycle = path.slice(cycleStart);
          cycles.push(cycle);
          return true;
        }
      }
    }

    path.pop();
    recursionStack.delete(nodeId);
    return false;
  }

  for (const [nodeId] of graph.nodes) {
    if (!visited.has(nodeId)) {
      dfs(nodeId, []);
    }
  }

  return { isValid: cycles.length === 0, cycles };
}
