/**
 * @openapi
 * /api/chat:
 *   post:
 *     summary: Send a chat request/message
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat response generated.
 *       400:
 *         description: Missing 'prompt' (string).
 *      502:
 *         description: Upstream error.
 */
import { NextResponse } from "next/server";
import { PrismaClient } from "@/lib/generated/prisma";
import { auth } from "@/lib/auth";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

const CHATBOT_URL =
  process.env.CHATBOT_URL ||
  "https://mickmcb-education-adivsor.hf.space/query";

export async function POST(req: Request) {
  try {

    // -----------------------------
    // GET SESSION → USER ID
    // -----------------------------
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { prompt } = await req.json();


    // -------------------------------------
    // UPDATE GLOBAL ENDPOINT STAT (/api/chat)
    // -------------------------------------
    await prisma.endpointStat.upsert({
      where: {
        method_endpoint: {
          method: "POST",
          endpoint: "/api/chat/https://mickmcb-education-adivsor.hf.space/query",
        },
      },
      update: { count: { increment: 1 } },
      create: {
        method: "POST",
        endpoint: "/api/chat/https://mickmcb-education-adivsor.hf.space/query",
        count: 1,
      },
    });

    // -------------------------------------
    // UPDATE USER USAGE STATS
    // -------------------------------------
    await prisma.userApiUsage.upsert({
      where: {
        userId_method_endpoint: {
          userId,
          method: "POST",
          endpoint: "/api/chat/https://mickmcb-education-adivsor.hf.space/query",
        },
      },
      update: { count: { increment: 1 } },
      create: {
        userId,
        method: "POST",
        endpoint: "/api/chat/https://mickmcb-education-adivsor.hf.space/query",
        count: 1,
      },
    });


    await prisma.user.update({
      where: { id: userId },
      data: { totalApiRequests: { increment: 1 } },
    });

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Missing 'prompt' (string)" },
        { status: 400 }
      );
    }

    const r = await fetch(CHATBOT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return NextResponse.json(
        { error: `Upstream error: ${r.status} ${text}` },
        { status: 502 }
      );
    }

    const data = (await r.json()) as { response?: string };
    return NextResponse.json({ response: data.response ?? "" });
  } catch (err) {
    console.error("Chat proxy error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
