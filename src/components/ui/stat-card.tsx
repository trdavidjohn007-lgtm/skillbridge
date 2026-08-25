import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3">{icon}</div>
      </div>
      {trend && (
        <div className="mt-3">
          <p
            className={`text-sm ${
              trendUp ? "text-green-600" : "text-gray-500"
            }`}
          >
            {trend}
          </p>
        </div>
      )}
    </div>
  );
}
