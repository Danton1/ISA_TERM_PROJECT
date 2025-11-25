// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
/**
 * @openapi
 * /api/v1/swagger:
 *   get:
 *     summary: Returns the OpenAPI specification (JSON)
 *     tags: [Internal]
 *     responses:
 *       200:
 *         description: Swagger spec returned.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: The full OpenAPI specification.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { swaggerSpec } from "../../../../swagger/swagger";

export async function GET() {
    return NextResponse.json(swaggerSpec);
}