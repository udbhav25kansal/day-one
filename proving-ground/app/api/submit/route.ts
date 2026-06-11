import { NextRequest, NextResponse } from "next/server";
import { loadSession, saveSession, appendEvent } from "@/lib/store";
import { judgeSession } from "@/lib/judge";

export async function POST(req: NextRequest) {
  const { sessionId, profile = "senior-consultant" } = (await req.json()) as {
    sessionId: string;
    profile?: "senior-consultant" | "manager";
  };
  const s = await loadSession(sessionId);
  if (!s) return NextResponse.json({ error: "unknown session" }, { status: 404 });
  if (s.status === "scored") return NextResponse.json(s.scorecard);

  appendEvent(s, { phase: "final", actor: "candidate", type: "submitted", content: profile });
  s.status = "submitted";
  const card = await judgeSession(s, profile); // mutates s.scorecard + s.status
  await saveSession(s);
  return NextResponse.json(card);
}
