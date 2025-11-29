import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const history = body.history || [];
  const userMessage = body.userMessage || "";
  const imageDataUrl = body.imageDataUrl || null;
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "Missing key" }, { status: 500 });
  const messages = [
    { role: "system", content: "Kamu asisten AI." },
    ...history,
    imageDataUrl
      ? { role: "user", content: [
          { type: "text", text: userMessage || "Jelaskan gambar" },
          { type: "image_url", image_url: { url: imageDataUrl } }
      ]}
      : { role: "user", content: userMessage }
  ];
  const r = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: "deepseek-chat", messages })
  });
  const data = await r.json();
  return NextResponse.json({ reply: data.choices?.[0]?.message?.content || "" });
}
