"use client";

import { AlertTriangle, ArrowRight, Clock } from "lucide-react";

interface SkillGap {
  competencyId: string;
  competencyName: string;
  domain: string;
  currentLevel: string;
  targetLevel: string;
  gapSize: number;
  priority: string;
  estimatedHours: number;
}

interface SkillGapListProps {
  gaps: SkillGap[];
  maxItems?: number;
  showDetails?: boolean;
}

export function SkillGapList({
  gaps,
  maxItems = 5,
  showDetails = true,
}: SkillGapListProps) {
  const displayGaps = gaps.slice(0, maxItems);

  const priorityColors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    low: "bg-green-100 text-green-800 border-green-200",
  };

  const priorityIcons: Record<string, string> = {
    critical: "🔴",
    high: "⚠️",
    medium: "🟡",
    low: "🟢",
  };

  if (displayGaps.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No skill gaps identified yet.</p>
        <p className="mt-1 text-sm text-gray-400">
          Complete an assessment to identify your learning opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayGaps.map((gap, index) => (
        <div
          key={gap.competencyId}
          className="flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            <span className="text-lg">{priorityIcons[gap.priority]}</span>
            <div>
              <h4 className="font-medium text-gray-900">
                {gap.competencyName}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                <span className="capitalize">{gap.currentLevel || "None"}</span>
                <ArrowRight className="h-3 w-3" />
                <span className="capitalize">{gap.targetLevel}</span>
                <span className="text-gray-400">•</span>
                <span className="capitalize">{gap.domain}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>{gap.estimatedHours}h</span>
            </div>
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                priorityColors[gap.priority] || "bg-gray-100 text-gray-800"
              }`}
            >
              {gap.priority}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
