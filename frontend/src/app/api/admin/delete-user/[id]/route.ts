// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
/**
 * @openapi
 * /api/admin/delete-user/{id}:
 *   delete:
 *     summary: Permanently delete a user by ID
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *       400:
 *         description: Missing user ID.
 *       401:
 *         description: Not authenticated.
 *       500:
 *         description: Failed to delete user (server error).
 */


import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

// Helper: Log API usage (for admin performing delete)
async function logApiCall(userId: string, method: string, endpoint: string) {
  // Global stat
  await prisma.endpointStat.upsert({
    where: { method_endpoint: { method, endpoint } },
    update: { count: { increment: 1 } },
    create: { method, endpoint, count: 1 },
  });

  // User-level stat
  await prisma.userApiUsage.upsert({
    where: {
      userId_method_endpoint: { userId, method, endpoint },
    },
    update: { count: { increment: 1 } },
    create: { userId, method, endpoint, count: 1 },
  });

  // Increment total
  await prisma.user.update({
    where: { id: userId },
    data: { totalApiRequests: { increment: 1 } },
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Target user ID (user being deleted)
    const { id: targetUserId } = await params;

    if (!targetUserId) {
      return NextResponse.json(
        { error: "Missing user ID" },
        { status: 400 }
      );
    }

    // Get SESSION USER (ADMIN performing the deletion)
    const session = await auth.api.getSession({ headers: req.headers });
    const adminId = session?.user?.id ?? null;

    if (!adminId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Log the DELETE action for the ADMIN user
    await logApiCall(adminId, "DELETE", "/api/admin/delete-user");

    // Delete the target user
    await prisma.user.delete({
      where: { id: targetUserId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete user error:", err);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}
