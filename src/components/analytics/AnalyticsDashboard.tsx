"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { AccuracyByTopic } from "./AccuracyByTopic";
import { RecentPerformance } from "./RecentPerformance";
import { cn } from "@/lib/utils";

interface AnalyticsData {
  overallAccuracy: number;
  totalAttempts: number;
  totalCorrect: number;
  byTopic: {
    topic: string;
    accuracy: number;
    correct: number;
    total: number;
  }[];
  recentPerformance: {
    date: string;
    accuracy: number;
    total: number;
  }[];
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/analytics");
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-gray-500 animate-pulse">Loading analytics…</div>
      </div>
    );
  }

  if (!data) {
    return <p className="text-gray-500">Failed to load analytics.</p>;
  }

  const { overallAccuracy, totalAttempts, totalCorrect, byTopic, recentPerformance } = data;

  return (
    <div className="space-y-6">
      {/* Summary stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Overall Accuracy"
          value={totalAttempts > 0 ? `${overallAccuracy}%` : "—"}
          sub={totalAttempts > 0 ? `${totalCorrect} / ${totalAttempts} correct` : "No attempts yet"}
          accent={
            totalAttempts === 0
              ? "gray"
              : overallAccuracy >= 80
              ? "green"
              : overallAccuracy >= 60
              ? "yellow"
              : "red"
          }
        />
        <StatCard
          label="Questions Attempted"
          value={totalAttempts.toString()}
          sub="all time"
          accent="blue"
        />
        <StatCard
          label="Topics Practiced"
          value={byTopic.length.toString()}
          sub="unique topics"
          accent="blue"
        />
      </div>

      {/* Recent performance trend */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentPerformance data={recentPerformance} />
        </CardContent>
      </Card>

      {/* Accuracy by topic */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Accuracy by Topic</CardTitle>
            <span className="text-xs text-gray-500">sorted lowest → highest</span>
          </div>
        </CardHeader>
        <CardContent>
          <AccuracyByTopic data={byTopic} />
        </CardContent>
      </Card>

      {/* Weak topics callout */}
      {byTopic.filter((t) => t.accuracy < 60).length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700">Focus Areas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 mb-3">
              These topics are below 60% — consider reviewing missed questions.
            </p>
            <div className="flex flex-wrap gap-2">
              {byTopic
                .filter((t) => t.accuracy < 60)
                .map((t) => (
                  <span
                    key={t.topic}
                    className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium"
                  >
                    {t.topic} — {t.accuracy}%
                  </span>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: "green" | "yellow" | "red" | "blue" | "gray";
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-gray-500">{label}</p>
        <p
          className={cn("text-3xl font-extrabold mt-1", {
            "text-green-600": accent === "green",
            "text-yellow-500": accent === "yellow",
            "text-red-500": accent === "red",
            "text-blue-600": accent === "blue",
            "text-gray-400": accent === "gray",
          })}
        >
          {value}
        </p>
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      </CardContent>
    </Card>
  );
}
