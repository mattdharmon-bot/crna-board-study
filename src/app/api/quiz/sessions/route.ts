import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quizConfigSchema } from "@/lib/validations/quiz";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = quizConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { topicId, difficulty, count, mode } = parsed.data;

  const questions = await prisma.question.findMany({
    where: {
      published: true,
      ...(topicId ? { topicId } : {}),
      ...(difficulty ? { difficulty } : {}),
    },
    select: { id: true },
  });

  if (questions.length === 0) {
    return NextResponse.json(
      { error: "No published questions match your filters." },
      { status: 422 }
    );
  }

  // Shuffle and slice to requested count
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, count);

  const quizSession = await prisma.quizSession.create({
    data: {
      userId: session.user.id,
      mode,
      topicId: topicId ?? null,
      difficulty: difficulty ?? null,
      totalCount: shuffled.length,
    },
  });

  return NextResponse.json(
    { sessionId: quizSession.id, questionIds: shuffled.map((q) => q.id) },
    { status: 201 }
  );
}
