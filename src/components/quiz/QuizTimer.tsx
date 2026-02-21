"use client";

import { useEffect, useState, useCallback } from "react";

interface QuizTimerProps {
  onTick?: (seconds: number) => void;
  running: boolean;
}

export function QuizTimer({ onTick, running }: QuizTimerProps) {
  const [seconds, setSeconds] = useState(0);

  const tick = useCallback(() => {
    setSeconds((s) => {
      const next = s + 1;
      onTick?.(next);
      return next;
    });
  }, [onTick]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [running, tick]);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <span className="font-mono text-lg font-semibold text-gray-700">
      {mm}:{ss}
    </span>
  );
}
