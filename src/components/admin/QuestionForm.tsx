"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { questionSchema, type QuestionInput } from "@/lib/validations/question";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Topic } from "@prisma/client";

interface QuestionFormProps {
  topics: Pick<Topic, "id" | "name">[];
  defaultValues?: Partial<QuestionInput>;
  questionId?: string;
}

export function QuestionForm({
  topics,
  defaultValues,
  questionId,
}: QuestionFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<QuestionInput>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      difficulty: "MEDIUM",
      published: false,
      ...defaultValues,
    },
  });

  const onSubmit = async (data: QuestionInput) => {
    setServerError(null);
    const url = questionId ? `/api/questions/${questionId}` : "/api/questions";
    const method = questionId ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const body = await res.json();
      setServerError(
        typeof body.error === "string" ? body.error : "Something went wrong"
      );
      return;
    }

    router.push("/admin/questions");
    router.refresh();
  };

  const watchPublished = useWatch({ control, name: "published" });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <Select
        id="topicId"
        label="Topic"
        error={errors.topicId?.message}
        {...register("topicId")}
      >
        <option value="">Select a topic...</option>
        {topics.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </Select>

      <Select
        id="difficulty"
        label="Difficulty"
        error={errors.difficulty?.message}
        {...register("difficulty")}
      >
        <option value="EASY">Easy</option>
        <option value="MEDIUM">Medium</option>
        <option value="HARD">Hard</option>
      </Select>

      <Textarea
        id="stem"
        label="Question Stem"
        placeholder="A 32-year-old patient undergoing..."
        className="min-h-[120px]"
        error={errors.stem?.message}
        {...register("stem")}
      />

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-gray-700">
          Answer Choices
        </legend>
        {(["A", "B", "C", "D"] as const).map((letter) => (
          <div key={letter} className="flex items-start gap-3">
            <span className="mt-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 shrink-0">
              {letter}
            </span>
            <div className="flex-1">
              <Input
                placeholder={`Option ${letter}`}
                error={errors.options?.[letter]?.message}
                {...register(`options.${letter}`)}
              />
            </div>
          </div>
        ))}
      </fieldset>

      <Select
        id="answer"
        label="Correct Answer"
        error={errors.answer?.message}
        {...register("answer")}
      >
        <option value="">Select correct answer...</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </Select>

      <Textarea
        id="explanation"
        label="Explanation"
        placeholder="The correct answer is... because..."
        className="min-h-[120px]"
        error={errors.explanation?.message}
        {...register("explanation")}
      />

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="published"
          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          {...register("published")}
        />
        <label htmlFor="published" className="text-sm font-medium text-gray-700">
          Publish immediately
          {watchPublished && (
            <span className="ml-2 text-xs text-green-600">
              (visible to students)
            </span>
          )}
        </label>
      </div>

      {serverError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" loading={isSubmitting}>
          {questionId ? "Save Changes" : "Create Question"}
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
