import { prisma } from "@/lib/prisma";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata = { title: "New Question | CRNA Admin" };

export default async function NewQuestionPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Question</h1>
      <Card>
        <CardHeader>
          <CardTitle>Question Details</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm topics={topics} />
        </CardContent>
      </Card>
    </div>
  );
}
