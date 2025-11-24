// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
/**
 * @openapi
 * /api/admin/enpoint-stats:
 *   get:
 *     summary: Get endpoint usage/performance statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Stats returned.
 *       500:
 *         description: Server error.
 */
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  const stats = await prisma.endpointStat.findMany({
    orderBy: { count: "desc" },
  });

  return NextResponse.json(stats);
}
