import { z } from "zod";
import { Difficulty } from "@prisma/client";

export const questionSchema = z.object({
  topicId: z.string().min(1, "Topic is required"),
  stem: z.string().min(1, "Question stem is required"),
  options: z.object({
    A: z.string().min(1),
    B: z.string().min(1),
    C: z.string().min(1),
    D: z.string().min(1),
  }),
  answer: z.enum(["A", "B", "C", "D"]),
  explanation: z.string().min(1, "Explanation is required"),
  difficulty: z.nativeEnum(Difficulty).default(Difficulty.MEDIUM),
  published: z.boolean().default(false),
});

export type QuestionInput = z.infer<typeof questionSchema>;
