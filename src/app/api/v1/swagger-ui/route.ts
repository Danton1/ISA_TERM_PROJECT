// ChatGPT and Copoilot assisted with the proofreading and optimization of this code.
/**
 * @openapi
 * /api/v1/swagger-ui:
 *   get:
 *     summary: Swagger UI documentation page
 *     tags: [Internal]
 *     responses:
 *       200:
 *         description: HTML UI returned.
 */

export const runtime = "nodejs";

import { NextResponse } from "next/server";

export function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Swagger UI</title>
        <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
      </head>
      <body>
        <div id="swagger"></div>

        <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
        <script>
          SwaggerUIBundle({
            url: "/api/v1/swagger",
            dom_id: "#swagger",
            presets: [SwaggerUIBundle.presets.apis],
            layout: "BaseLayout"
          });
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" }
  });
}
