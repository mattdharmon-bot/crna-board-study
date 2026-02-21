import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitAnswerSchema } from "@/lib/validations/quiz";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const quizSession = await prisma.quizSession.findUnique({
    where: { id },
    include: { attempts: { select: { questionId: true } } },
  });

  if (!quizSession) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quizSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (quizSession.finishedAt) {
    return NextResponse.json({ error: "Session already finished" }, { status: 409 });
  }

  const body = await req.json();
  const parsed = submitAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { questionId, selected, timeSpent } = parsed.data;

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    select: { answer: true, explanation: true, options: true, stem: true, topic: { select: { name: true } } },
  });

  if (!question) return NextResponse.json({ error: "Question not found" }, { status: 404 });

  const correct = question.answer === selected;

  await prisma.attempt.create({
    data: {
      sessionId: id,
      questionId,
      selected,
      correct,
      timeSpent: timeSpent ?? null,
    },
  });

  // Check if this was the last question in the session
  const attemptCount = quizSession.attempts.length + 1;
  const isFinished = attemptCount >= quizSession.totalCount;

  if (isFinished) {
    await prisma.quizSession.update({
      where: { id },
      data: { finishedAt: new Date() },
    });
  }

  return NextResponse.json({
    correct,
    correctAnswer: question.answer,
    explanation: question.explanation,
    isFinished,
    attemptCount,
    totalCount: quizSession.totalCount,
  });
}
