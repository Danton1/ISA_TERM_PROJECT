// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
/**
 * @openapi
 * /api/admin/log-dashboard-open:
 *   post:
 *     summary: Log when an admin dashboard is opened
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Log entry stored.
 *       500:
 *         description: Logging failed.
 */
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({ headers: req.headers });
    const userId = session?.user?.id ?? null;

    // --------------------------------------------------------
    // 1️⃣ Log dashboard endpoint usage (GLOBAL ENDPOINT STATS)
    // --------------------------------------------------------
    await prisma.endpointStat.upsert({
      where: {
        method_endpoint: {
          endpoint: "/admin/dashboard",
          method: "GET",
        },
      },
      update: {
        count: { increment: 1 },
        updatedAt: new Date(),
      },
      create: {
        endpoint: "/admin/dashboard",
        method: "GET",
        count: 1,
      },
    });

    // --------------------------------------------------------
    // 2️⃣ Log user-specific usage (ONLY IF USER IS LOGGED IN)
    // --------------------------------------------------------
    if (userId) {
      await prisma.userApiUsage.upsert({
        where: {
          userId_method_endpoint: {
            userId,
            method: "GET",
            endpoint: "/admin/dashboard",
          },
        },
        update: { count: { increment: 1 } },
        create: {
          userId,
          method: "GET",
          endpoint: "/admin/dashboard",
          count: 1,
        },
      });

      // --------------------------------------------------------
      // 3️⃣ Increment totalApiRequests on the user
      // --------------------------------------------------------
      await prisma.user.update({
        where: { id: userId },
        data: {
          totalApiRequests: { increment: 1 },
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to log dashboard opening:", err);
    return NextResponse.json(
      { error: "Logging failed" },
      { status: 500 }
    );
  }
}
