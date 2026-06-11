import { NextRequest, NextResponse } from "next/server";

// Text-to-speech proxy. Peripheral, fully severable: if OPENAI_API_KEY is unset
// it returns 503 and the client silently falls back to text (or browser TTS).
// Reasoning stays Claude-only; this is candidate-experience, never evaluation signal.
const VOICES: Record<string, string> = {
  partner: "shimmer", // Rachel Chen - Engagement Partner
  senior: "echo", // Marcus Webb - Senior Associate
  it: "nova", // Sarah Okafor - IT / Platform Lead
  risk: "onyx", // David Osei - Risk & Quality Lead
  panel: "sage",
};

const TTS_MODEL = "gpt-4o-mini-tts";

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "tts disabled (no OPENAI_API_KEY)" }, { status: 503 });

  const { text, persona } = (await req.json()) as { text: string; persona?: string };
  if (!text?.trim()) return NextResponse.json({ error: "no text" }, { status: 400 });

  const voice = VOICES[persona ?? ""] ?? "alloy";

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: TTS_MODEL,
      voice,
      input: text.slice(0, 4000),
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: `tts upstream ${res.status}: ${await res.text()}` }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new Response(audio, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
  });
}
