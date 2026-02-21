import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { TopicForm } from "@/components/admin/TopicForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata = { title: "Edit Topic | CRNA Admin" };

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const topic = await prisma.topic.findUnique({ where: { id } });
  if (!topic) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Topic</h1>
      <Card>
        <CardHeader>
          <CardTitle>{topic.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicForm
            topicId={topic.id}
            defaultValues={{
              name: topic.name,
              description: topic.description ?? undefined,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
