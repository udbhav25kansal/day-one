import { NextRequest, NextResponse } from "next/server";
import { loadSession, saveSession, appendEvent } from "@/lib/store";
import { SynthesisDoc, SpecDoc } from "@/lib/types";

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    sessionId: string;
    synthesis?: SynthesisDoc;
    spec?: SpecDoc;
    componentsUsed?: string[];
    contributedComponent?: string;
    revisionNote?: string;
  };
  const s = await loadSession(body.sessionId);
  if (!s || s.status !== "active") return NextResponse.json({ error: "no active session" }, { status: 404 });

  if (body.synthesis) {
    s.synthesis = body.synthesis;
    appendEvent(s, { phase: "synthesis", actor: "candidate", type: "synthesis_saved", content: JSON.stringify(body.synthesis) });
  }
  if (body.spec) {
    s.spec = body.spec;
    appendEvent(s, { phase: "build", actor: "candidate", type: "spec_saved", content: JSON.stringify(body.spec) });
  }
  for (const c of body.componentsUsed ?? [])
    appendEvent(s, { phase: "build", actor: "candidate", type: "component_used", content: c });
  if (body.contributedComponent)
    appendEvent(s, { phase: "build", actor: "candidate", type: "component_contributed", content: body.contributedComponent });
  if (body.revisionNote)
    appendEvent(s, { phase: "boardroom", actor: "candidate", type: "revision_saved", content: body.revisionNote });

  await saveSession(s);
  return NextResponse.json({ ok: true });
}
