import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 5000,
      messages: [
        { role: "system", content: body.system },
        ...body.messages,
      ],
    }),
  });
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? JSON.stringify(data);
  return NextResponse.json({ content: [{ text }] });
}
