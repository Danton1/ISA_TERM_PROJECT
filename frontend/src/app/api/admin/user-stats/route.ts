// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
/**
 * @openapi
 * /api/admin/user-stats:
 *   get:
 *     summary: Get overall system user statistics
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Stats returned.
 *       500:
 *         description: Failed to load stats.
 */
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Fetch grouped user stats WITH user name
    const stats = await prisma.userApiUsage.groupBy({
      by: ["userId"],
      _sum: { count: true },
      orderBy: { _sum: { count: "desc" } }
    });

    // Fetch user names for each userId
    const userIds = stats.map((s) => s.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, email: true },
    });

    const usersById = Object.fromEntries(users.map((u) => [u.id, u]));

    // Format final output
    const formatted = stats.map((s) => ({
      userId: s.userId,
      totalUsage: s._sum.count || 0,
      user: {
        name: usersById[s.userId]?.name || "Unknown",
        email: usersById[s.userId]?.email || "Unknown"
      }
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Failed to fetch endpoint stats:", err);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 }
    );
  }
}
