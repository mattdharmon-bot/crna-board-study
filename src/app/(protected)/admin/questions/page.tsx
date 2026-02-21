import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { QuestionActions } from "./QuestionActions";

export const metadata = { title: "Questions | CRNA Admin" };

const difficultyVariant = {
  EASY: "green",
  MEDIUM: "yellow",
  HARD: "red",
} as const;

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: { topic: { select: { name: true } } },
  });

  const published = questions.filter((q) => q.published).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Questions</h1>
          <p className="text-sm text-gray-500 mt-1">
            {published} published · {questions.length - published} drafts
          </p>
        </div>
        <Link href="/admin/questions/new">
          <Button>+ New Question</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{questions.length} Questions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {questions.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">
              No questions yet.{" "}
              <Link href="/admin/questions/new" className="text-blue-600 hover:underline">
                Create the first one.
              </Link>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Stem</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Topic</th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">Difficulty</th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">Status</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 max-w-xs">
                      <p className="truncate text-gray-800">{q.stem}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                      {q.topic.name}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={difficultyVariant[q.difficulty]}>
                        {q.difficulty}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant={q.published ? "green" : "gray"}>
                        {q.published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <QuestionActions
                        questionId={q.id}
                        published={q.published}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
