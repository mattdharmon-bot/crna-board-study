import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { QuizConfig } from "@/components/quiz/QuizConfig";

export const metadata = { title: "Configure Quiz | CRNA Board Study" };

export default async function QuizPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
    where: { questions: { some: { published: true } } },
  });

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-gray-900">Configure Quiz</h1>
      <Card>
        <CardHeader>
          <CardTitle>Quiz Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizConfig topics={topics} />
        </CardContent>
      </Card>
    </div>
  );
}
