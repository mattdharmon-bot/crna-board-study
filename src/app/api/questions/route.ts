import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { questionSchema } from "@/lib/validations/question";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const topicId = searchParams.get("topicId");
  const difficulty = searchParams.get("difficulty");
  const published = searchParams.get("published");

  const questions = await prisma.question.findMany({
    where: {
      ...(topicId ? { topicId } : {}),
      ...(difficulty ? { difficulty: difficulty as never } : {}),
      ...(published !== null ? { published: published === "true" } : {}),
    },
    include: { topic: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = questionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const question = await prisma.question.create({ data: parsed.data });
  return NextResponse.json(question, { status: 201 });
}
