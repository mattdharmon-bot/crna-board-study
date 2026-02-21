"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MissedQuestion {
  questionId: string;
  stem: string;
  options: Record<string, string>;
  answer: string;
  explanation: string;
  difficulty: string;
  topic: string;
  selected: string;
  lastAttempted: string;
}

const difficultyVariant = {
  EASY: "green",
  MEDIUM: "yellow",
  HARD: "red",
} as const;

const LETTERS = ["A", "B", "C", "D"] as const;

function MissedCard({ q, expanded, onToggle }: {
  q: MissedQuestion;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="border-l-4 border-l-red-400">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="gray">{q.topic}</Badge>
            <Badge variant={difficultyVariant[q.difficulty as keyof typeof difficultyVariant] ?? "gray"}>
              {q.difficulty}
            </Badge>
            <span className="text-xs text-gray-400">
              {new Date(q.lastAttempted).toLocaleDateString()}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onToggle} className="shrink-0">
            {expanded ? "Collapse" : "Review"}
          </Button>
        </div>
        <p className="text-sm font-medium text-gray-900 mt-2 leading-snug">{q.stem}</p>
      </CardHeader>

      {expanded && (
        <CardContent className="pt-0 space-y-3">
          {LETTERS.map((letter) => {
            const isCorrect = q.answer === letter;
            const isWrong = q.selected === letter && !isCorrect;
            return (
              <div
                key={letter}
                className={cn(
                  "flex items-start gap-2 px-3 py-2 rounded-lg text-sm",
                  isCorrect && "bg-green-50 text-green-800",
                  isWrong && "bg-red-50 text-red-800",
                  !isCorrect && !isWrong && "text-gray-500"
                )}
              >
                <span className="font-bold shrink-0">{letter}.</span>
                <span className="flex-1">{q.options[letter]}</span>
                {isCorrect && (
                  <span className="text-xs font-semibold text-green-600 shrink-0">✓ Correct</span>
                )}
                {isWrong && (
                  <span className="text-xs font-semibold text-red-500 shrink-0">Your answer</span>
                )}
              </div>
            );
          })}

          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              Explanation
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{q.explanation}</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface ReviewListProps {
  missed: MissedQuestion[];
}

export function ReviewList({ missed }: ReviewListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [topicFilter, setTopicFilter] = useState<string>("all");

  if (missed.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-4xl">🎉</p>
        <p className="text-lg font-semibold text-gray-700">No missed questions!</p>
        <p className="text-gray-500">Keep taking quizzes and any incorrect answers will appear here.</p>
        <Link href="/quiz">
          <Button className="mt-2">Start a Quiz</Button>
        </Link>
      </div>
    );
  }

  const topics = ["all", ...Array.from(new Set(missed.map((q) => q.topic))).sort()];
  const filtered = topicFilter === "all" ? missed : missed.filter((q) => q.topic === topicFilter);

  return (
    <div className="space-y-4">
      {/* Topic filter */}
      <div className="flex flex-wrap gap-2">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setTopicFilter(t)}
            className={cn(
              "px-3 py-1 rounded-full text-sm font-medium transition-colors",
              topicFilter === t
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {t === "all" ? `All (${missed.length})` : t}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((q) => (
          <MissedCard
            key={q.questionId}
            q={q}
            expanded={expandedId === q.questionId}
            onToggle={() =>
              setExpandedId(expandedId === q.questionId ? null : q.questionId)
            }
          />
        ))}
      </div>
    </div>
  );
}
