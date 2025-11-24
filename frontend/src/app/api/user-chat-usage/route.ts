/**
 * @openapi
 * /api/user-chat-usage:
 *   get:
 *     summary: Get the authenticated user's chat usage statistics
 *     tags: [Usage]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usage stats returned.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const userId = session.user.id;

  const usage = await prisma.userApiUsage.findUnique({
    where: {
      userId_method_endpoint: {
        userId,
        method: "POST",
        endpoint: "/api/chat/https://mickmcb-education-adivsor.hf.space/query",
      },
    },
    select: { count: true },
  });

  return NextResponse.json({ count: usage?.count ?? 0 });
}
