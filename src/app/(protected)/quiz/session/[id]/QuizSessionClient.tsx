"use client";

import { useEffect, useState } from "react";
import { QuizSession } from "@/components/quiz/QuizSession";
import type { QuizMode } from "@prisma/client";

type State =
  | { status: "loading" }
  | { status: "ready"; ids: string[] }
  | { status: "error" };

interface QuizSessionClientProps {
  sessionId: string;
  mode: QuizMode;
  totalCount: number;
  answeredIds: string[];
}

export function QuizSessionClient({
  sessionId,
  mode,
  totalCount,
  answeredIds,
}: QuizSessionClientProps) {
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    async function resolve() {
      const stored = sessionStorage.getItem(`quiz-${sessionId}`);
      if (stored) {
        const ids: string[] = JSON.parse(stored);
        const remaining = ids.filter((id) => !answeredIds.includes(id));
        setState({ status: "ready", ids: remaining.length > 0 ? remaining : ids });
        return;
      }

      // No sessionStorage — page was refreshed. Fetch session to check status.
      const res = await fetch(`/api/quiz/sessions/${sessionId}`);
      const data = await res.json();
      const answeredCount = (data.attempts as { questionId: string }[]).length;

      if (answeredCount >= totalCount) {
        window.location.href = `/quiz/results/${sessionId}`;
      } else {
        setState({ status: "error" });
      }
    }

    resolve();
  }, [sessionId, answeredIds, totalCount]);

  if (state.status === "loading") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Loading session…</div>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">
          Could not restore quiz state. Please start a new quiz.
        </p>
      </div>
    );
  }

  return (
    <QuizSession
      sessionId={sessionId}
      questionIds={state.ids}
      mode={mode}
    />
  );
}
