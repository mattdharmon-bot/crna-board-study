import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const question = await prisma.question.findUnique({
    where: { id, published: true },
    select: {
      id: true,
      stem: true,
      options: true,
      difficulty: true,
      topic: { select: { name: true } },
      // Never expose answer or explanation here — only returned after submit
    },
  });

  if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(question);
}
