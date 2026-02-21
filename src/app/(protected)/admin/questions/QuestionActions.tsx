"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import Link from "next/link";

interface QuestionActionsProps {
  questionId: string;
  published: boolean;
}

export function QuestionActions({ questionId, published }: QuestionActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const togglePublish = async () => {
    setLoading(true);
    await fetch(`/api/questions/${questionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        loading={loading}
        onClick={togglePublish}
      >
        {published ? "Unpublish" : "Publish"}
      </Button>
      <Link href={`/admin/questions/${questionId}/edit`}>
        <Button variant="secondary" size="sm">Edit</Button>
      </Link>
      <Button
        variant="danger"
        size="sm"
        loading={loading}
        onClick={handleDelete}
      >
        Delete
      </Button>
    </div>
  );
}
