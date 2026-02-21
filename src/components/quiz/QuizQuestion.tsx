"use client";

import { cn } from "@/lib/utils";

interface QuizQuestionProps {
  stem: string;
  options: { A: string; B: string; C: string; D: string };
  selected: string | null;
  correctAnswer: string | null;
  submitted: boolean;
  onSelect: (letter: string) => void;
}

const LETTERS = ["A", "B", "C", "D"] as const;

export function QuizQuestion({
  stem,
  options,
  selected,
  correctAnswer,
  submitted,
  onSelect,
}: QuizQuestionProps) {
  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed text-gray-900 font-medium">{stem}</p>

      <div className="space-y-2">
        {LETTERS.map((letter) => {
          const isSelected = selected === letter;
          const isCorrect = submitted && correctAnswer === letter;
          const isWrong = submitted && isSelected && correctAnswer !== letter;

          return (
            <button
              key={letter}
              disabled={submitted}
              onClick={() => onSelect(letter)}
              className={cn(
                "w-full flex items-start gap-3 px-4 py-3 rounded-lg border text-left text-sm transition-colors",
                !submitted && !isSelected &&
                  "border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50",
                !submitted && isSelected &&
                  "border-blue-500 bg-blue-50 text-blue-900",
                isCorrect &&
                  "border-green-500 bg-green-50 text-green-900",
                isWrong &&
                  "border-red-500 bg-red-50 text-red-900",
                submitted && !isSelected && correctAnswer !== letter &&
                  "border-gray-200 bg-gray-50 text-gray-500 opacity-60"
              )}
            >
              <span
                className={cn(
                  "shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  !submitted && !isSelected && "bg-gray-200 text-gray-600",
                  !submitted && isSelected && "bg-blue-500 text-white",
                  isCorrect && "bg-green-500 text-white",
                  isWrong && "bg-red-500 text-white",
                  submitted && !isSelected && correctAnswer !== letter && "bg-gray-200 text-gray-400"
                )}
              >
                {letter}
              </span>
              <span className="leading-relaxed">{options[letter]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
