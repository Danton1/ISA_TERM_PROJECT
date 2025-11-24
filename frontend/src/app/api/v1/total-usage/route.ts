// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ total_usage: 0 });
  }

  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalApiRequests: true },
  });

  return NextResponse.json({
    total_usage: user?.totalApiRequests ?? 0,
  });
}
