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

  const quizSession = await prisma.quizSession.findUnique({
    where: { id },
    include: {
      attempts: {
        select: { questionId: true, correct: true, selected: true },
      },
    },
  });

  if (!quizSession) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (quizSession.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(quizSession);
}
