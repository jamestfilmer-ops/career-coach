// src/app/api/chat/route.js
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
        model: "gpt-4o",
        max_tokens: 12000,
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

    if (data.choices?.[0]?.finish_reason === "length") {
      return NextResponse.json({ error: "Response was cut off — hit Try Again, it usually works on the second attempt." }, { status: 500 });
    }

    const text = data.choices?.[0]?.message?.content || "";
    return NextResponse.json({ content: [{ type: "text", text }] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}