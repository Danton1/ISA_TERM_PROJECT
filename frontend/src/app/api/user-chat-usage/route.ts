/**
 * @openapi
 * /api/user-chat-usage:
 *   get:
 *     summary: Get the authenticated user's chat usage statistics (returns 0 if not logged in)
 *     tags: [Usage]
 *     responses:
 *       200:
 *         description: Usage stats returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 *       500:
 *         description: Server error.
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
