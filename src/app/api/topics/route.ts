import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { topicSchema } from "@/lib/validations/topic";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { questions: true } } },
  });
  return NextResponse.json(topics);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = topicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const topic = await prisma.topic.create({ data: parsed.data });
  return NextResponse.json(topic, { status: 201 });
}
