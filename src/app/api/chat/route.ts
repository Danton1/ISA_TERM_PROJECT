import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const CHATBOT_URL =
  process.env.CHATBOT_URL ||
  "https://mickmcb-education-adivsor.hf.space/query";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
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
      // node runtime; no need for cache here
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
