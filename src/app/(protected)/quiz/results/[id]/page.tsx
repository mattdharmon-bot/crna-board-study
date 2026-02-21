import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const metadata = { title: "Quiz Results | CRNA Board Study" };

export default async function QuizResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [session, { id }] = await Promise.all([auth(), params]);
  if (!session) redirect("/login");

  const quizSession = await prisma.quizSession.findUnique({
    where: { id },
    include: {
      attempts: {
        include: {
          question: {
            include: { topic: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!quizSession || quizSession.userId !== session.user.id) notFound();

  const total = quizSession.attempts.length;
  const correct = quizSession.attempts.filter((a) => a.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  const options = ["A", "B", "C", "D"] as const;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quiz Results</h1>
        <Link href="/quiz">
          <Button variant="secondary">New Quiz</Button>
        </Link>
      </div>

      {/* Score summary */}
      <Card>
        <CardContent className="py-6 flex flex-col items-center gap-2">
          <div
            className={cn(
              "text-6xl font-extrabold",
              pct >= 80
                ? "text-green-600"
                : pct >= 60
                ? "text-yellow-500"
                : "text-red-500"
            )}
          >
            {pct}%
          </div>
          <p className="text-gray-600">
            {correct} correct out of {total} questions
          </p>
          <Badge
            variant={pct >= 80 ? "green" : pct >= 60 ? "yellow" : "red"}
            className="text-sm px-3 py-1"
          >
            {pct >= 80 ? "Excellent" : pct >= 60 ? "Passing" : "Needs Work"}
          </Badge>
        </CardContent>
      </Card>

      {/* Per-question review */}
      <div className="space-y-4">
        {quizSession.attempts.map((attempt, i) => {
          const q = attempt.question;
          const opts = q.options as Record<string, string>;
          return (
            <Card
              key={attempt.id}
              className={cn(
                "border-l-4",
                attempt.correct ? "border-l-green-400" : "border-l-red-400"
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">
                    Q{i + 1} · {q.topic.name}
                  </span>
                  <Badge variant={attempt.correct ? "green" : "red"}>
                    {attempt.correct ? "Correct" : "Incorrect"}
                  </Badge>
                </div>
                <CardTitle className="text-sm font-medium text-gray-900 mt-1">
                  {q.stem}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {options.map((letter) => {
                  const isSelected = attempt.selected === letter;
                  const isCorrect = q.answer === letter;
                  return (
                    <div
                      key={letter}
                      className={cn(
                        "flex items-start gap-2 px-3 py-2 rounded-lg text-sm",
                        isCorrect && "bg-green-50 text-green-800",
                        isSelected && !isCorrect && "bg-red-50 text-red-800",
                        !isSelected && !isCorrect && "text-gray-500"
                      )}
                    >
                      <span className="font-bold shrink-0">{letter}.</span>
                      <span>{opts[letter]}</span>
                      {isCorrect && (
                        <span className="ml-auto text-xs font-semibold text-green-600 shrink-0">
                          ✓ Correct
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="ml-auto text-xs font-semibold text-red-500 shrink-0">
                          Your answer
                        </span>
                      )}
                    </div>
                  );
                })}

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                    Explanation
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {q.explanation}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-3 pb-8">
        <Link href="/quiz">
          <Button>Start New Quiz</Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="secondary">Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
