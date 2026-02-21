"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface TopicAccuracy {
  topic: string;
  accuracy: number;
  correct: number;
  total: number;
}

interface AccuracyByTopicProps {
  data: TopicAccuracy[];
}

function barColor(accuracy: number) {
  if (accuracy >= 80) return "#22c55e";
  if (accuracy >= 60) return "#eab308";
  return "#ef4444";
}

export function AccuracyByTopic({ data }: AccuracyByTopicProps) {
  if (data.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-8">
        No data yet. Take a quiz to see your accuracy by topic.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tickFormatter={(v) => `${v}%`}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          type="category"
          dataKey="topic"
          width={120}
          tick={{ fontSize: 12 }}
        />
        <Tooltip
          formatter={(value, _name, props) =>
            [`${value ?? 0}% (${props.payload.correct}/${props.payload.total})`, "Accuracy"]
          }
        />
        <Bar dataKey="accuracy" radius={[0, 4, 4, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={barColor(entry.accuracy)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
