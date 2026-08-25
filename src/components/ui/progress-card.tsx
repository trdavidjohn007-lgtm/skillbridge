"use client";

interface ProgressCardProps {
  title: string;
  value: number;
  max: number;
  unit?: string;
  showPercentage?: boolean;
}

export function ProgressCard({
  title,
  value,
  max,
  unit = "",
  showPercentage = true,
}: ProgressCardProps) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <span className="text-sm font-medium text-gray-900">
          {value} {unit}
        </span>
      </div>
      <div className="mt-3">
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary-500 transition-all duration-500"
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
        {showPercentage && (
          <p className="mt-1 text-right text-xs text-gray-500">
            {percentage}% of {max} {unit}
          </p>
        )}
      </div>
    </div>
  );
}
