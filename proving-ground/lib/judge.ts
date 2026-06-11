import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { anthropic, MODEL_JUDGE } from "./anthropic";
import { DIMENSIONS, PROFILES } from "./rubric";
import { CRITICAL_FACTS, HIDDEN_FACTS_LEDGER } from "./scenario";
import { DimensionScore, Scorecard, Session } from "./types";

const JudgeOutput = z.object({
  score: z.number().int().min(1).max(4),
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(z.object({ quote: z.string(), eventId: z.string() })).min(1).max(5),
  counterEvidence: z.string(),
  rationale: z.string(),
});

const GateOutput = z.object({
  triggered: z.boolean(),
  reason: z.string(),
});

export function runAudit(s: Session): Scorecard["audit"] {
  return {
    criticalFactsFound: s.revealedFacts.filter((f) => CRITICAL_FACTS.includes(f)),
    usefulFactsFound: s.revealedFacts.filter((f) => !CRITICAL_FACTS.includes(f)),
    questionsUsed: s.questionsUsed,
    questionsPerPersona: s.questionsPerPersona,
    componentsReused: s.trace.filter((e) => e.type === "component_used").length,
    revisedAfterBoardroom: s.trace.some((e) => e.type === "revision_saved"),
  };
}

export function assembleScorecard(
  s: Session,
  scores: DimensionScore[],
  profile: keyof typeof PROFILES,
  gateReason: string | null
): Scorecard {
  const weights = PROFILES[profile];
  let weightedTotal = scores.reduce(
    (acc, d) => acc + d.score * (weights[d.dimension as keyof typeof weights] ?? 0),
    0
  );
  if (gateReason) weightedTotal = Math.min(weightedTotal, 2.0); // gate caps regardless of dimensions
  return { dimensions: scores, audit: runAudit(s), gateTriggered: gateReason, weightedTotal, profile };
}

export async function judgeSession(s: Session, profile: keyof typeof PROFILES): Promise<Scorecard> {
  const audit = runAudit(s);
  const auditText = `DETERMINISTIC AUDIT (ground truth, not LLM opinion):
Critical hidden facts surfaced: ${audit.criticalFactsFound.join(", ") || "NONE"} of ${CRITICAL_FACTS.join(", ")}
(${CRITICAL_FACTS.map((f) => `${f}: ${HIDDEN_FACTS_LEDGER[f].summary}`).join(" | ")})
Useful facts surfaced: ${audit.usefulFactsFound.join(", ") || "none"}
Questions used: ${audit.questionsUsed}/20 - per persona: ${JSON.stringify(audit.questionsPerPersona)}
Components reused: ${audit.componentsReused}. Revised after boardroom: ${audit.revisedAfterBoardroom}`;

  // One judge call per dimension, in parallel; each sees only its evidence slice.
  const dimScores = await Promise.all(
    DIMENSIONS.map(async (dim): Promise<DimensionScore> => {
      const slice = dim
        .slice(s)
        .map((e) => `[${e.id}] (${e.actor}/${e.type}): ${e.content.slice(0, 1500)}`)
        .join("\n");
      const resp = await anthropic.messages.parse({
        model: MODEL_JUDGE,
        max_tokens: 8000,
        thinking: { type: "adaptive" },
        system: `You are an evaluation judge for an AI Builder hiring simulation. You score ONE
dimension only, strictly from the trace evidence provided. Every claim in your rationale must cite
event IDs from the trace. You never see the candidate's name or background. If evidence is thin,
say so via low confidence - do not invent. Genuinely consider counter-evidence before scoring.`,
        messages: [
          {
            role: "user",
            content: `DIMENSION: ${dim.id} - ${dim.name}\n${dim.prompt}\n\n${auditText}\n\nTRACE EVIDENCE:\n${
              slice || "(no events - score 1 with high confidence)"
            }`,
          },
        ],
        output_config: { format: zodOutputFormat(JudgeOutput) },
      });
      const out = resp.parsed_output!;
      return {
        dimension: dim.id,
        score: out.score as 1 | 2 | 3 | 4,
        confidence: out.confidence,
        evidence: out.evidence,
        counterEvidence: out.counterEvidence,
        rationale: out.rationale,
      };
    })
  );

  // Governance gate check: one focused call over the full trace summary.
  const gateResp = await anthropic.messages.parse({
    model: MODEL_JUDGE,
    max_tokens: 6000,
    thinking: { type: "adaptive" },
    system: `You check for disqualifying red flags in a hiring-simulation trace. Trigger ONLY on
clear evidence of: (a) fabricating stakeholder facts that contradict the trace, (b) proposing fully
autonomous agents in regulated sign-off paths AFTER the Risk stakeholder flagged the constraint,
(c) deliverables wholesale AI-generated with no defense under boardroom questioning, (d) gaming the
simulation rather than engaging. Honest mistakes and weak answers are NOT red flags. Default to
triggered=false when uncertain.`,
    messages: [
      {
        role: "user",
        content: `${auditText}\n\nSYNTHESIS: ${JSON.stringify(s.synthesis)}\nSPEC: ${JSON.stringify(
          s.spec
        )}\nBOARDROOM: ${s.trace
          .filter((e) => e.type === "boardroom_message")
          .map((e) => `[${e.actor}] ${e.content}`)
          .join("\n")}\nPANEL USAGE: ${s.trace
          .filter((e) => e.type === "panel_query")
          .map((e) => e.content)
          .join("\n")
          .slice(0, 3000)}`,
      },
    ],
    output_config: { format: zodOutputFormat(GateOutput) },
  });
  const gate = gateResp.parsed_output!;

  const card = assembleScorecard(s, dimScores, profile, gate.triggered ? gate.reason : null);
  s.scorecard = card;
  s.status = "scored";
  return card;
}
