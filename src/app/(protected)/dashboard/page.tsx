import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Dashboard | CRNA Board Study" };

async function getStats(userId: string) {
  const [totalAttempts, correctAttempts, recentSessions, totalQuestions] =
    await Promise.all([
      prisma.attempt.count({ where: { session: { userId } } }),
      prisma.attempt.count({ where: { session: { userId }, correct: true } }),
      prisma.quizSession.findMany({
        where: { userId },
        orderBy: { startedAt: "desc" },
        take: 5,
        include: {
          _count: { select: { attempts: true } },
          attempts: { select: { correct: true } },
        },
      }),
      prisma.question.count({ where: { published: true } }),
    ]);

  return { totalAttempts, correctAttempts, recentSessions, totalQuestions };
}

async function getAdminStats() {
  const [topics, questions, users] = await Promise.all([
    prisma.topic.count(),
    prisma.question.count(),
    prisma.user.count(),
  ]);
  return { topics, questions, users };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) return null;

  const isAdmin = session.user.role === "ADMIN";

  if (isAdmin) {
    const stats = await getAdminStats();
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label="Total Topics" value={stats.topics} />
          <StatCard label="Total Questions" value={stats.questions} />
          <StatCard label="Registered Users" value={stats.users} />
        </div>
        <div className="flex gap-3">
          <Link href="/admin/topics">
            <Button variant="secondary">Manage Topics</Button>
          </Link>
          <Link href="/admin/questions/new">
            <Button>+ New Question</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { totalAttempts, correctAttempts, recentSessions, totalQuestions } =
    await getStats(session.user.id);
  const accuracy =
    totalAttempts > 0
      ? Math.round((correctAttempts / totalAttempts) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name ?? session.user.email}
        </h1>
        <Link href="/quiz">
          <Button size="lg">Start Quiz</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Questions Attempted" value={totalAttempts} />
        <StatCard
          label="Overall Accuracy"
          value={accuracy !== null ? `${accuracy}%` : "—"}
        />
        <StatCard label="Available Questions" value={totalQuestions} />
      </div>

      {recentSessions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSessions.map((s) => {
                const correct = s.attempts.filter((a) => a.correct).length;
                const total = s._count.attempts;
                const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
                return (
                  <div
                    key={s.id}
                    className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {s.mode} mode
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(s.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {correct}/{total}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          pct >= 70 ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {pct}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </CardContent>
    </Card>
  );
}
