import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { QuizSessionClient } from "./QuizSessionClient";

export const metadata = { title: "Quiz Session | CRNA Board Study" };

export default async function QuizSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  if (!session) redirect("/login");

  const quizSession = await prisma.quizSession.findUnique({
    where: { id },
    include: {
      attempts: { select: { questionId: true }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!quizSession || quizSession.userId !== session.user.id) notFound();

  if (quizSession.finishedAt) {
    redirect(`/quiz/results/${id}`);
  }

  return (
    <QuizSessionClient
      sessionId={id}
      mode={quizSession.mode}
      totalCount={quizSession.totalCount}
      answeredIds={quizSession.attempts.map((a) => a.questionId)}
    />
  );
}
