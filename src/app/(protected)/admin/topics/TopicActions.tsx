"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import Link from "next/link";

interface TopicActionsProps {
  topicId: string;
  topicName: string;
}

export function TopicActions({ topicId, topicName }: TopicActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Delete topic "${topicName}"? This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/topics/${topicId}`, { method: "DELETE" });
    router.refresh();
    setDeleting(false);
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link href={`/admin/topics/${topicId}/edit`}>
        <Button variant="secondary" size="sm">Edit</Button>
      </Link>
      <Button
        variant="danger"
        size="sm"
        loading={deleting}
        onClick={handleDelete}
      >
        Delete
      </Button>
    </div>
  );
}
