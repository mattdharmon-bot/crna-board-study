import { z } from "zod";
import { Difficulty, QuizMode } from "@prisma/client";

export const quizConfigSchema = z.object({
  topicId: z.string().optional(),
  difficulty: z.nativeEnum(Difficulty).optional(),
  count: z.number().int().min(1).max(100),
  mode: z.nativeEnum(QuizMode),
});

export const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  selected: z.enum(["A", "B", "C", "D"]),
  timeSpent: z.number().int().min(0).optional(),
});

export type QuizConfigInput = z.infer<typeof quizConfigSchema>;
export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>;
