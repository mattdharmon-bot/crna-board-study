"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { Topic } from "@prisma/client";

interface QuizConfigProps {
  topics: Pick<Topic, "id" | "name">[];
}

export function QuizConfig({ topics }: QuizConfigProps) {
  const router = useRouter();
  const [topicId, setTopicId] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [count, setCount] = useState(10);
  const [mode, setMode] = useState<"TUTOR" | "TIMED">("TUTOR");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setLoading(true);
    setError(null);

    const res = await fetch("/api/quiz/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topicId: topicId || undefined,
        difficulty: difficulty || undefined,
        count,
        mode,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Failed to create quiz session.");
      setLoading(false);
      return;
    }

    // Store question order in sessionStorage
    sessionStorage.setItem(
      `quiz-${data.sessionId}`,
      JSON.stringify(data.questionIds)
    );

    router.push(`/quiz/session/${data.sessionId}`);
  };

  return (
    <div className="space-y-5">
      <Select
        id="mode"
        label="Quiz Mode"
        value={mode}
        onChange={(e) => setMode(e.target.value as "TUTOR" | "TIMED")}
      >
        <option value="TUTOR">Tutor Mode (see explanation after each question)</option>
        <option value="TIMED">Timed Mode (review at end)</option>
      </Select>

      <Select
        id="topic"
        label="Topic (optional)"
        value={topicId}
        onChange={(e) => setTopicId(e.target.value)}
      >
        <option value="">All Topics</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>

      <Select
        id="difficulty"
        label="Difficulty (optional)"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="">All Difficulties</option>
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </Select>

      <div className="flex flex-col gap-1">
        <label htmlFor="count" className="text-sm font-medium text-gray-700">
          Number of Questions: <span className="font-bold text-blue-600">{count}</span>
        </label>
        <input
          id="count"
          type="range"
          min={1}
          max={50}
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1</span>
          <span>50</span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <Button onClick={handleStart} loading={loading} size="lg" className="w-full">
        Start Quiz
      </Button>
    </div>
  );
}
