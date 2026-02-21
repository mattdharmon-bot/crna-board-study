import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { TopicActions } from "./TopicActions";

export const metadata = { title: "Topics | CRNA Admin" };

export default async function AdminTopicsPage() {
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { questions: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Topics</h1>
        <Link href="/admin/topics/new">
          <Button>+ New Topic</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{topics.length} Topics</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {topics.length === 0 ? (
            <p className="px-6 py-8 text-center text-gray-500">
              No topics yet.{" "}
              <Link href="/admin/topics/new" className="text-blue-600 hover:underline">
                Create the first one.
              </Link>
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500">Description</th>
                  <th className="px-6 py-3 text-center font-medium text-gray-500">Questions</th>
                  <th className="px-6 py-3 text-right font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topics.map((topic) => (
                  <tr key={topic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{topic.name}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {topic.description ?? <span className="italic text-gray-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">
                      {topic._count.questions}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <TopicActions topicId={topic.id} topicName={topic.name} />
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
