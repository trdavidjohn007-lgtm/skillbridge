"use client";

import { BookOpen, Clock, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface LearningPathNode {
  pathId: string;
  pathName: string;
  totalNodes: number;
  completedNodes: number;
  inProgressNodes: number;
  completionPercentage: number;
  totalEstimatedHours: number;
  completedHours: number;
}

interface LearningPathCardProps {
  path: LearningPathNode;
}

export function LearningPathCard({ path }: LearningPathCardProps) {
  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
            <BookOpen className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{path.pathName}</h3>
            <p className="text-sm text-gray-500">
              {path.totalNodes} courses • {path.totalEstimatedHours} hours
            </p>
          </div>
        </div>
        <Link
          href={`/learning/${path.pathId}`}
          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
        >
          View details
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            {path.completedNodes}/{path.totalNodes} courses completed
          </span>
          <span className="font-medium text-gray-900">
            {path.completionPercentage}%
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${path.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span>{path.completedNodes} completed</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-blue-500" />
          <span>
            {path.completedHours}/{path.totalEstimatedHours} hours
          </span>
        </div>
        {path.inProgressNodes > 0 && (
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-yellow-500" />
            <span>{path.inProgressNodes} in progress</span>
          </div>
        )}
      </div>
    </div>
  );
}
