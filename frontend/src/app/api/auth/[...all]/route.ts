/**
 * @openapi
 * /api/auth/{all}:
 *   post:
 *     summary: Authentication handler (catch-all route)
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: all
 *         required: true
 *         schema:
 *           type: string
 *         description: Sub-path for auth routing.
 *     responses:
 *       200:
 *         description: Auth request processed.
 */
import { auth } from "@/lib/auth";
import { PrismaClient } from "@/lib/generated/prisma";
import { toNextJsHandler } from "better-auth/next-js";

const prisma = new PrismaClient();

const { POST: originalPOST, GET: originalGET } = toNextJsHandler(auth);

// Helper: log counters safely
async function logApiCall(userId: string | null, method: string, endpoint: string) {
  // Always log GLOBAL stats
  console.log(`Logging API call: ${method} ${endpoint} (userId: ${userId})`);
  await prisma.endpointStat.upsert({
    where: { method_endpoint: { method, endpoint } },
    update: { count: { increment: 1 } },
    create: { method, endpoint, count: 1 },
  });

  // Only log user-specific stats if user exists
  if (userId) {
    await prisma.userApiUsage.upsert({
      where: {
        userId_method_endpoint: { userId, method, endpoint },
      },
      update: { count: { increment: 1 } },
      create: { userId, method, endpoint, count: 1 },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { totalApiRequests: { increment: 1 } },
    });
  }
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // clone request so body can be read twice
  const cloned = req.clone();
  const body = await cloned.json().catch(() => null);

  // run Better-Auth
  const response = await originalPOST(req);

  let userId: string | null = null;

  // if email exists ⇒ extract user directly (works for login & sign-up)
  if (body?.email) {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });
    userId = user?.id || null;
  }

  // IMPORTANT: sign-out does NOT include email
  // → must read session from request cookie BEFORE logout
  if (pathname.endsWith("/sign-out")) {
    const session = await auth.api.getSession({ headers: req.headers });
    userId = session?.user?.id || userId;
  }

  // ------------------------------
  //   HANDLE ENDPOINT LOGGING
  // ------------------------------

  // SIGN-UP
  if (pathname.endsWith("/sign-up/email")) {
    await logApiCall(userId, "POST", "/api/auth/signup");
  }

  // SKIP auto login after signup
  if (pathname.endsWith("/sign-in/email") && !body?.password) {
    console.log("Skipping auto-login after signup");
    return response;
  }

  // SIGN-IN
  if (pathname.endsWith("/sign-in/email") && body?.password) {
    await logApiCall(userId, "POST", "/api/auth/signin");
  }

  // SIGN-OUT (ALWAYS LOG)
  if (pathname.endsWith("/sign-out")) {
    await logApiCall(userId, "POST", "/api/auth/signout");
  }

  if (pathname.endsWith("/forget-password")) {
    await logApiCall(userId, "PUT", "/api/auth/update-password");
  }

  return response;
}

export { originalGET as GET };
