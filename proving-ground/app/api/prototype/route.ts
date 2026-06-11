import { NextRequest, NextResponse } from "next/server";
import { anthropic, MODEL_CHAT } from "@/lib/anthropic";
import { loadSession, saveSession, appendEvent } from "@/lib/store";
import { COMPONENT_LIBRARY } from "@/lib/components-library";

const SYSTEM = `You turn an AI Builder candidate's design into a single, beautiful, EXECUTIVE-level
prototype document. Output ONE complete, self-contained HTML document and nothing else (no markdown
fences, no commentary). Hard rules:

- Self-contained: a single <!doctype html> file with ONE inline <style>. NO external scripts, fonts,
  images, or CDNs (it renders in a sandboxed iframe with scripts disabled).
- Aesthetic (match exactly): background #faf6ef; ink text #34302a; soft cards #fffdf9 with 1px #e7ddcf
  borders and gentle rounded corners (16px) and soft shadows; accents lavender #b3a6d6, sage #a3c4a0,
  sky #9ec6dd, peach #e7b48f. Headings in Georgia serif; body in system sans. Generous whitespace.
- The centerpiece is an EXECUTIVE FLOWCHART of the workflow the candidate designed: each step is a
  node, laid out top-to-bottom (or in clear stages), connected by CSS arrows (e.g. a small triangle
  or a vertical line with a chevron). Color each node by owner: AGENT steps tinted sky, HUMAN
  steps/approval gates tinted peach. Put the component used (if any) as a small chip on the node.
  Keep node labels to a short phrase, not sentences.
- Below the flowchart, compact spec panels (small cards or a tight two-column grid): Problem,
  Optimizing for, Autonomy & sign-off, Data touched, Failure modes, Evaluation plan, Components
  reused, Deliberately out of scope. Each panel is 1-2 tight lines distilled from the candidate's own
  words - high value, no padding, no filler. If a field is empty, omit that panel.
- Concise overall. An executive should grasp the whole system in one screen. Do not pad.
- A small header with the system's name (infer a crisp name from the design) and one-line purpose.`;

export async function POST(req: NextRequest) {
  const { sessionId } = (await req.json()) as { sessionId: string };
  const s = await loadSession(sessionId);
  if (!s || s.status !== "active") return NextResponse.json({ error: "no active session" }, { status: 404 });

  const buildTranscript = s.trace
    .filter((e) => e.type === "build_prompt" || e.type === "build_reply")
    .map((e) => `${e.type === "build_prompt" ? "CANDIDATE" : "BUILD AGENT"}: ${e.content}`)
    .join("\n\n");
  const components = s.trace.filter((e) => e.type === "component_used").map((e) => e.content);
  const compNames = components
    .map((id) => COMPONENT_LIBRARY.find((c) => c.id === id)?.name ?? id)
    .join(", ");

  const payload = {
    problemBrief: s.synthesis ?? {},
    spec: s.spec ?? {},
    componentsReused: compNames || "(none selected)",
    buildAgentSession: buildTranscript || "(the candidate did not use the build agent)",
  };

  const resp = await anthropic.messages.create({
    model: MODEL_CHAT,
    max_tokens: 16000,
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `Build the prototype document from this candidate's design. Use ALL of it - the build-agent
session, every spec field, the problem brief, and the components they reused.\n\n${JSON.stringify(payload, null, 2)}`,
      },
    ],
  });

  let html = resp.content.find((b): b is Extract<typeof b, { type: "text" }> => b.type === "text")?.text ?? "";
  // strip accidental markdown fences if the model added them
  html = html.replace(/^```html?\s*/i, "").replace(/```\s*$/i, "").trim();

  s.prototypeHtml = html;
  appendEvent(s, { phase: "build", actor: "builder", type: "prototype_built", content: "Prototype document generated from prompt + spec." });
  await saveSession(s);

  return NextResponse.json({ html });
}
