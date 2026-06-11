import { NextRequest, NextResponse } from "next/server";
import { loadSession, saveSession, appendEvent } from "@/lib/store";
import { ensureSamplesLoaded } from "@/lib/samples";

// Human-in-the-loop sign-off: a reviewer can override any dimension score. The
// override is recorded on the scorecard and logged to the trace with a reason -
// the evaluation system itself keeps an audit trail, mirroring the Trusted-AI bar
// it scores candidates against.
export async function POST(req: NextRequest) {
  await ensureSamplesLoaded();
  const { sessionId, dimension, score, reason } = (await req.json()) as {
    sessionId: string;
    dimension: string;
    score: number;
    reason: string;
  };
  const s = await loadSession(sessionId);
  if (!s || !s.scorecard) return NextResponse.json({ error: "no scorecard" }, { status: 404 });

  const dim = s.scorecard.dimensions.find((d) => d.dimension === dimension);
  if (!dim) return NextResponse.json({ error: "unknown dimension" }, { status: 400 });

  dim.humanOverride = { score, reason };
  appendEvent(s, {
    phase: "final",
    actor: "reviewer",
    type: "submitted",
    content: `override:${dimension}:${score}:${reason}`,
  });
  await saveSession(s);
  return NextResponse.json({ ok: true });
}
