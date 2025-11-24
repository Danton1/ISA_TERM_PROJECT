/**
 * @openapi
 * /api/admin/users:
 *   get:
 *     summary: List all platform users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User list returned.
 */

import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("Failed to load users", err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
