import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL_CHAT } from "@/lib/anthropic";
import { loadSession, saveSession, appendEvent } from "@/lib/store";
import { COMPONENT_LIBRARY } from "@/lib/components-library";

const BUILDER_SYSTEM = `You are an embedded build agent inside a prototyping studio. The candidate
directs you to build an agentic-workflow prototype for an audit-practice problem. Output format:
a concrete workflow definition in markdown - numbered steps, each step marked [AGENT] or [HUMAN],
with data inputs/outputs and which library component (if any) it uses. Available components:
${COMPONENT_LIBRARY.map((c) => `${c.id}: ${c.desc}`).join("\n")}
Build exactly what is asked. If the instruction is vague, build a reasonable version and state your
assumptions at the top. Keep it tight - this is a prototype, not documentation.`;

export async function POST(req: NextRequest) {
  const { sessionId, instruction } = (await req.json()) as { sessionId: string; instruction: string };
  const s = await loadSession(sessionId);
  if (!s || s.status !== "active") return NextResponse.json({ error: "no active session" }, { status: 404 });

  const history = s.trace
    .filter((e) => e.type === "build_prompt" || e.type === "build_reply")
    .map((e) => ({
      role: e.type === "build_prompt" ? ("user" as const) : ("assistant" as const),
      content: e.content,
    }));
  appendEvent(s, { phase: "build", actor: "candidate", type: "build_prompt", content: instruction });

  const resp = await anthropic.messages.create({
    model: MODEL_CHAT,
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: BUILDER_SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [...history, { role: "user", content: instruction }],
  });

  const text = resp.content.find((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")?.text ?? "";
  appendEvent(s, { phase: "build", actor: "builder", type: "build_reply", content: text });
  await saveSession(s);
  return NextResponse.json({ artifact: text });
}
