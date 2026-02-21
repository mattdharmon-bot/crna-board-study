"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { topicSchema, type TopicInput } from "@/lib/validations/topic";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TopicFormProps {
  defaultValues?: Partial<TopicInput>;
  topicId?: string;
}

export function TopicForm({ defaultValues, topicId }: TopicFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TopicInput>({
    resolver: zodResolver(topicSchema),
    defaultValues,
  });

  const onSubmit = async (data: TopicInput) => {
    setServerError(null);
    const url = topicId ? `/api/topics/${topicId}` : "/api/topics";
    const method = topicId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(body.error ?? "Something went wrong");
      return;
    }

    router.push("/admin/topics");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
      <Input
        id="name"
        label="Topic Name"
        placeholder="e.g. Pharmacology"
        error={errors.name?.message}
        {...register("name")}
      />
      <Textarea
        id="description"
        label="Description (optional)"
        placeholder="Brief description of this topic..."
        error={errors.description?.message}
        {...register("description")}
      />
      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}
      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {topicId ? "Save Changes" : "Create Topic"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
