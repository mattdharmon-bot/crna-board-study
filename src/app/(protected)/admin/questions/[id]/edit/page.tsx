import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { QuestionForm } from "@/components/admin/QuestionForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { Difficulty } from "@prisma/client";

export const metadata = { title: "Edit Question | CRNA Admin" };

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [question, topics] = await Promise.all([
    prisma.question.findUnique({ where: { id } }),
    prisma.topic.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!question) notFound();

  const options = question.options as { A: string; B: string; C: string; D: string };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Question</h1>
      <Card>
        <CardHeader>
          <CardTitle className="truncate">{question.stem}</CardTitle>
        </CardHeader>
        <CardContent>
          <QuestionForm
            topics={topics}
            questionId={question.id}
            defaultValues={{
              topicId: question.topicId,
              stem: question.stem,
              options,
              answer: question.answer as "A" | "B" | "C" | "D",
              explanation: question.explanation,
              difficulty: question.difficulty as Difficulty,
              published: question.published,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
