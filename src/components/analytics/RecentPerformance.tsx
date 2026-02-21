"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface PerformancePoint {
  date: string;
  accuracy: number;
  total: number;
}

interface RecentPerformanceProps {
  data: PerformancePoint[];
}

export function RecentPerformance({ data }: RecentPerformanceProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No sessions yet. Take a quiz to track your progress.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 24, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          tickFormatter={(d) =>
            new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" })
          }
        />
        <YAxis
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <Tooltip
          formatter={(value, _name, props) => [
            `${value ?? 0}% (${props.payload.total} questions)`,
            "Accuracy",
          ]}
          labelFormatter={(label) =>
            new Date(label).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
            })
          }
        />
        <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "70%", position: "right", fontSize: 11, fill: "#94a3b8" }} />
        <Line
          type="monotone"
          dataKey="accuracy"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 4, fill: "#3b82f6" }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
