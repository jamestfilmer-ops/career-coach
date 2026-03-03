// src/app/api/chat/route.js
// Proxies chat requests to OpenAI GPT-4o-mini.

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { system, messages } = await req.json();
    if (!messages?.length) return NextResponse.json({ error: "No messages" }, { status: 400 });

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [
          ...(system ? [{ role: "system", content: system }] : []),
          ...messages,
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";

    // Return in Anthropic-compatible shape so the frontend doesn't need changes
    return NextResponse.json({ content: [{ type: "text", text }] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}