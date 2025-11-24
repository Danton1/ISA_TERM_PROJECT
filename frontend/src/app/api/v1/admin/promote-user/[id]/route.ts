// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
/**
 * @openapi
 * /api/v1/admin/promote-user/{id}:
 *   put:
 *     summary: Promote a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to promote.
 *     responses:
 *       200:
 *         description: User promoted successfully.
 *       400:
 *         description: Missing user ID.
 *       401:
 *         description: Unauthorized: no session.
 *       402:
 *         description: You cannot promote yourself.
 *       500:
 *         description: Promotion failed due to server error.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth"; // needed to detect WHO is promoting

const prisma = new PrismaClient();

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // -----------------------------
    // 1️⃣ Unwrap dynamic route param
    // -----------------------------
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    // -----------------------------
    // 2️⃣ Identify WHO is promoting
    // -----------------------------
    const session = await auth.api.getSession({ headers: req.headers });
    const actingUserId = session?.user?.id || null;

    if (!actingUserId) {
      return NextResponse.json(
        { error: "Unauthorized: no session" },
        { status: 401 }
      );
    }

    // Safety: cannot promote yourself
    if (actingUserId === id) {
      return NextResponse.json(
        { error: "You cannot promote yourself." },
        { status: 402 }
      );
    }

    // --------------------------------
    // 3️⃣ Promote target user to admin
    // --------------------------------
    const updated = await prisma.user.update({
      where: { id },
      data: { role: "admin" },
    });

    // -------------------------------------
    // 4️⃣ Log API usage for the *acting user*
    // -------------------------------------
    await prisma.endpointStat.upsert({
      where: {
        method_endpoint: {
          method: "PUT",
          endpoint: "/api/v1/admin/promote-user",
        },
      },
      update: { count: { increment: 1 } },
      create: {
        method: "PUT",
        endpoint: "/api/v1/admin/promote-user",
        count: 1,
      },
    });

    await prisma.userApiUsage.upsert({
      where: {
        userId_method_endpoint: {
          userId: actingUserId,
          method: "PUT",
          endpoint: "/api/v1/admin/promote-user",
        },
      },
      update: { count: { increment: 1 } },
      create: {
        userId: actingUserId,
        method: "PUT",
        endpoint: "/api/v1/admin/promote-user",
        count: 1,
      },
    });

    await prisma.user.update({
      where: { id: actingUserId },
      data: { totalApiRequests: { increment: 1 } },
    });

    return NextResponse.json({ success: true, promotedUser: updated });
  } catch (err) {
    console.error("Promote user error:", err);
    return NextResponse.json(
      { error: "Failed to promote user" },
      { status: 500 }
    );
  }
}
