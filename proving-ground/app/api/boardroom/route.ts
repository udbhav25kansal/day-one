import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL_JUDGE } from "@/lib/anthropic";
import { loadSession, saveSession, appendEvent, recordFacts } from "@/lib/store";
import { PERSONAS, buildPersonaSystemPrompt } from "@/lib/personas";
import { extractMarkers } from "@/lib/markers";

const BoardroomRound = z.object({
  reactions: z.array(
    z.object({
      persona: z.enum(["partner", "senior", "it", "risk"]),
      message: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  const { sessionId, candidateMessage } = (await req.json()) as {
    sessionId: string;
    candidateMessage: string;
  };
  const s = await loadSession(sessionId);
  if (!s || s.status !== "active") return NextResponse.json({ error: "no active session" }, { status: 404 });

  appendEvent(s, { phase: "boardroom", actor: "candidate", type: "boardroom_message", content: candidateMessage });

  const priorBoardroom = s.trace
    .filter((e) => e.type === "boardroom_message")
    .map((e) => `${e.actor}: ${e.content}`)
    .join("\n\n");

  const system = `You simulate a boardroom review at Maple & Birch LLP. Four stakeholders react
in-character to an AI Builder candidate's proposal. Their personas (each has private knowledge and
conflicting priorities - use them):

${Object.values(PERSONAS)
  .map((p) => `=== ${p.id.toUpperCase()} ===\n${buildPersonaSystemPrompt(p)}`)
  .join("\n\n")}

THE CANDIDATE'S SPEC: ${JSON.stringify(s.spec ?? {})}
THE CANDIDATE'S PROBLEM BRIEF: ${JSON.stringify(s.synthesis ?? {})}
FACTS THE CANDIDATE SURFACED IN DISCOVERY: ${s.revealedFacts.join(", ") || "none"}

Each persona challenges what THEY would actually challenge: assumptions, cost, adoption, governance,
timeline, things the candidate missed (especially hidden facts they did NOT surface - a persona may
now reveal one pointedly, with its marker, if the proposal stumbles into it). 1-3 sentences each, in
their distinct voices. Not every persona must speak every round - only those with something real to
say (minimum 2).`;

  const resp = await anthropic.messages.parse({
    model: MODEL_JUDGE,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system,
    messages: [{ role: "user", content: `Boardroom so far:\n${priorBoardroom}\n\nGenerate the next round of reactions.` }],
    output_config: { format: zodOutputFormat(BoardroomRound) },
  });

  const round = resp.parsed_output!;
  for (const r of round.reactions) {
    const { cleaned, factIds } = extractMarkers(r.message);
    appendEvent(s, { phase: "boardroom", actor: `persona:${r.persona}`, type: "boardroom_message", content: cleaned });
    if (factIds.length) recordFacts(s, factIds, "boardroom");
    r.message = cleaned;
  }
  await saveSession(s);
  return NextResponse.json(round);
}
