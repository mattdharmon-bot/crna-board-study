"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { QuizQuestion } from "./QuizQuestion";
import { QuizTimer } from "./QuizTimer";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  stem: string;
  options: { A: string; B: string; C: string; D: string };
  topic: { name: string };
  difficulty: string;
}

interface SubmitResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
  isFinished: boolean;
  attemptCount: number;
  totalCount: number;
}

interface QuizSessionProps {
  sessionId: string;
  questionIds: string[];
  mode: "TUTOR" | "TIMED";
}

export function QuizSession({ sessionId, questionIds, mode }: QuizSessionProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [timedSeconds, setTimedSeconds] = useState(0);
  const questionStartRef = useRef<number>(0);

  useEffect(() => {
    const qId = questionIds[currentIndex];
    if (!qId) return;

    async function loadQuestion() {
      setLoadingQuestion(true);
      setSelected(null);
      setSubmitted(false);
      setResult(null);
      questionStartRef.current = Date.now();
      const res = await fetch(`/api/quiz/question/${qId}`);
      const data = await res.json();
      setQuestion(data);
      setLoadingQuestion(false);
    }

    loadQuestion();
  }, [currentIndex, questionIds]);

  const handleSubmit = async () => {
    if (!selected || !question) return;
    setSubmitting(true);

    const timeSpent = Math.round((Date.now() - questionStartRef.current) / 1000);

    const res = await fetch(`/api/quiz/sessions/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        questionId: question.id,
        selected,
        timeSpent,
      }),
    });

    const data: SubmitResult = await res.json();
    setResult(data);

    if (mode === "TUTOR") {
      setSubmitted(true);
    } else {
      // Timed mode: auto-advance or finish
      if (data.isFinished) {
        router.push(`/quiz/results/${sessionId}`);
      } else {
        setCurrentIndex((i) => i + 1);
      }
    }
    setSubmitting(false);
  };

  const handleNext = () => {
    if (result?.isFinished) {
      router.push(`/quiz/results/${sessionId}`);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const progress = ((currentIndex + (submitted ? 1 : 0)) / questionIds.length) * 100;

  if (loadingQuestion) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 animate-pulse">Loading question…</div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Question{" "}
          <span className="font-semibold text-gray-800">
            {currentIndex + 1}
          </span>{" "}
          of {questionIds.length}
        </div>
        {mode === "TIMED" && (
          <QuizTimer running={!submitted} onTick={setTimedSeconds} />
        )}
        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
          {question.difficulty}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
            {question.topic.name}
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <QuizQuestion
            stem={question.stem}
            options={question.options}
            selected={selected}
            correctAnswer={submitted ? result?.correctAnswer ?? null : null}
            submitted={submitted}
            onSelect={setSelected}
          />

          {/* Tutor mode explanation */}
          {mode === "TUTOR" && submitted && result && (
            <div
              className={cn(
                "mt-6 rounded-lg border p-4 space-y-2",
                result.correct
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              )}
            >
              <p
                className={cn(
                  "font-semibold text-sm",
                  result.correct ? "text-green-700" : "text-red-700"
                )}
              >
                {result.correct ? "✓ Correct!" : `✗ Incorrect — Answer: ${result.correctAnswer}`}
              </p>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.explanation}
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {submitted && result && (
              <span>
                {result.attemptCount}/{result.totalCount} answered
              </span>
            )}
          </div>
          <div className="flex gap-3">
            {!submitted ? (
              <Button
                onClick={handleSubmit}
                loading={submitting}
                disabled={!selected}
              >
                Submit Answer
              </Button>
            ) : (
              <Button onClick={handleNext}>
                {result?.isFinished ? "View Results" : "Next Question →"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>

      {/* Hidden but tracked for timed mode */}
      {mode === "TIMED" && <span className="sr-only">{timedSeconds}</span>}
    </div>
  );
}
