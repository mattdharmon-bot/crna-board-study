import { TopicForm } from "@/components/admin/TopicForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export const metadata = { title: "New Topic | CRNA Admin" };

export default function NewTopicPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Topic</h1>
      <Card>
        <CardHeader>
          <CardTitle>Topic Details</CardTitle>
        </CardHeader>
        <CardContent>
          <TopicForm />
        </CardContent>
      </Card>
    </div>
  );
}
