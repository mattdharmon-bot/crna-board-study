import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Get all incorrect attempts, grouped by question, most recently missed first
  const incorrectAttempts = await prisma.attempt.findMany({
    where: { session: { userId }, correct: false },
    include: {
      question: {
        include: { topic: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Deduplicate by question — keep most recent attempt per question
  const seen = new Set<string>();
  const missedQuestions = incorrectAttempts
    .filter((a) => {
      if (seen.has(a.questionId)) return false;
      seen.add(a.questionId);
      return true;
    })
    .map((a) => ({
      questionId: a.questionId,
      stem: a.question.stem,
      options: a.question.options,
      answer: a.question.answer,
      explanation: a.question.explanation,
      difficulty: a.question.difficulty,
      topic: a.question.topic.name,
      lastAttempted: a.createdAt.toISOString(),
      selected: a.selected,
    }));

  return NextResponse.json(missedQuestions);
}
