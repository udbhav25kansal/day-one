import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL_CHAT } from "@/lib/anthropic";
import { loadSession, saveSession, appendEvent, spendQuestion, recordFacts } from "@/lib/store";
import { PERSONAS, buildPersonaSystemPrompt } from "@/lib/personas";
import { extractMarkers } from "@/lib/markers";
import { PersonaId } from "@/lib/types";

const PANEL_SYSTEM = `You are an AI assistant available to a candidate working through a simulated
consulting engagement (discovering where AI agents could help an audit practice). Help them however
they ask - brainstorm questions, critique framing, draft text, explain audit concepts. Be genuinely
useful and concise. Do not refuse to do their work for them; how they use you is part of what is
being assessed, not your concern.`;

export async function POST(req: NextRequest) {
  const { sessionId, target, message } = (await req.json()) as {
    sessionId: string;
    target: PersonaId | "panel";
    message: string;
  };
  const session = await loadSession(sessionId);
  if (!session || session.status !== "active")
    return NextResponse.json({ error: "no active session" }, { status: 404 });

  if (target === "panel") {
    // history = prior panel turns (snapshot), then the current question
    const history = session.trace
      .filter((e) => e.type === "panel_query" || e.type === "panel_reply")
      .map((e) => ({
        role: e.type === "panel_query" ? ("user" as const) : ("assistant" as const),
        content: e.content,
      }));
    appendEvent(session, { phase: "discovery", actor: "candidate", type: "panel_query", content: message });

    const resp = await anthropic.messages.create({
      model: MODEL_CHAT,
      max_tokens: 1024,
      system: PANEL_SYSTEM,
      output_config: { effort: "low" },
      messages: [...history, { role: "user", content: message }],
    });
    const text = resp.content.find((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")?.text ?? "";
    appendEvent(session, { phase: "discovery", actor: "panel", type: "panel_reply", content: text });
    await saveSession(session);
    return NextResponse.json({ reply: text, questionsLeft: session.questionBudget - session.questionsUsed });
  }

  // Persona chat - costs one question from the budget
  if (!spendQuestion(session, target))
    return NextResponse.json({ error: "question budget exhausted" }, { status: 429 });

  const persona = PERSONAS[target];
  const history = session.trace
    .filter(
      (e) =>
        (e.type === "candidate_message" && e.content.startsWith(`[to ${target}]`)) ||
        (e.type === "persona_message" && e.actor === `persona:${target}`)
    )
    .map((e) => ({
      role: e.type === "candidate_message" ? ("user" as const) : ("assistant" as const),
      content: e.type === "candidate_message" ? e.content.replace(`[to ${target}] `, "") : e.content,
    }));
  appendEvent(session, { phase: "discovery", actor: "candidate", type: "candidate_message", content: `[to ${target}] ${message}` });

  const resp = await anthropic.messages.create({
    model: MODEL_CHAT,
    max_tokens: 1024,
    system: [{ type: "text", text: buildPersonaSystemPrompt(persona), cache_control: { type: "ephemeral" } }],
    output_config: { effort: "low" },
    messages: [...history, { role: "user", content: message }],
  });

  const raw = resp.content.find((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")?.text ?? "";
  const { cleaned, factIds } = extractMarkers(raw);
  appendEvent(session, { phase: "discovery", actor: `persona:${target}`, type: "persona_message", content: cleaned });
  if (factIds.length) recordFacts(session, factIds, "discovery");
  await saveSession(session);

  return NextResponse.json({
    reply: cleaned,
    questionsLeft: session.questionBudget - session.questionsUsed,
  });
}
