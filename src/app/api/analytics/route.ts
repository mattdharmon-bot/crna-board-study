import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const [attempts, recentSessions] = await Promise.all([
    prisma.attempt.findMany({
      where: { session: { userId } },
      include: {
        question: {
          select: {
            topicId: true,
            topic: { select: { name: true } },
          },
        },
      },
    }),
    prisma.quizSession.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 14,
      include: {
        attempts: { select: { correct: true } },
      },
    }),
  ]);

  // Accuracy by topic
  const topicMap = new Map<
    string,
    { name: string; correct: number; total: number }
  >();

  for (const attempt of attempts) {
    const { topicId, topic } = attempt.question;
    const existing = topicMap.get(topicId) ?? {
      name: topic.name,
      correct: 0,
      total: 0,
    };
    topicMap.set(topicId, {
      name: existing.name,
      correct: existing.correct + (attempt.correct ? 1 : 0),
      total: existing.total + 1,
    });
  }

  const byTopic = Array.from(topicMap.values())
    .map(({ name, correct, total }) => ({
      topic: name,
      correct,
      total,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
    }))
    .sort((a, b) => a.accuracy - b.accuracy);

  // Recent performance (last 14 sessions)
  const recentPerformance = recentSessions
    .map((s) => {
      const total = s.attempts.length;
      const correct = s.attempts.filter((a) => a.correct).length;
      return {
        date: s.startedAt.toISOString().slice(0, 10),
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        total,
      };
    })
    .reverse();

  // Overall stats
  const totalAttempts = attempts.length;
  const totalCorrect = attempts.filter((a) => a.correct).length;
  const overallAccuracy =
    totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return NextResponse.json({
    overallAccuracy,
    totalAttempts,
    totalCorrect,
    byTopic,
    recentPerformance,
  });
}
