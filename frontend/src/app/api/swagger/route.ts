/**
 * @openapi
 * /api/swagger:
 *   get:
 *     summary: Returns the OpenAPI specification (JSON)
 *     tags: [Internal]
 *     responses:
 *       200:
 *         description: Swagger spec returned.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { swaggerSpec } from "../../../swagger/swagger";

export async function GET() {
    return NextResponse.json(swaggerSpec);
}