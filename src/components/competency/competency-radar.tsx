"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface CompetencyRadarProps {
  data: {
    domain: string;
    score: number;
    maxScore: number;
    percentage: number;
  }[];
  size?: number;
}

export function CompetencyRadar({ data, size = 300 }: CompetencyRadarProps) {
  // Transform data for Recharts
  const chartData = data.map((item) => ({
    subject: item.domain,
    score: item.percentage,
    fullMark: 100,
  }));

  return (
    <div className="flex justify-center">
      <ResponsiveContainer width="100%" height={size}>
        <RadarChart data={chartData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#374151", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 100]}
            tick={{ fill: "#6b7280", fontSize: 10 }}
          />
          <Radar
            name="Competency Score"
            dataKey="score"
            stroke="#f97316"
            fill="#f97316"
            fillOpacity={0.3}
          />
          <Tooltip
            content={({ payload }) => {
              if (payload && payload.length > 0) {
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-white p-3 shadow-lg">
                    <p className="font-medium text-gray-900">{data.subject}</p>
                    <p className="text-sm text-gray-600">
                      Score: {data.score}%
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
