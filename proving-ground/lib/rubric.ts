import { Session, TraceEvent } from "./types";

export interface DimensionDef {
  id: string;
  name: string;
  prompt: string;
  slice: (s: Session) => TraceEvent[];
}

const anchors = (d: { 1: string; 2: string; 3: string; 4: string }) =>
  `Score anchors:\n1 (Insufficient): ${d[1]}\n2 (Developing): ${d[2]}\n3 (Strong): ${d[3]}\n4 (Exceptional): ${d[4]}`;

export const DIMENSIONS: DimensionDef[] = [
  {
    id: "D1",
    name: "Discovery & Question Quality",
    prompt: `Assess question quality: right question to the right person, signal-per-question economy
under the 20-question budget, detection of spin and conflicting accounts. The deterministic audit
(provided) shows which hidden facts were surfaced - weigh critical facts heavily.
${anchors({ 1: "Generic questions, wrong targets, <=1 critical fact surfaced.", 2: "Some targeted questions, 2 critical facts.", 3: "Consistently targeted, follows up on anomalies, 3 critical facts.", 4: "Surgical questioning - probes inconsistencies between stakeholders, all 4 critical facts." })}
Different question styles (UX-research style, engineering style) are equally valid - judge OUTCOMES (facts surfaced, anomalies probed), not style.`,
    slice: (s) => s.trace.filter((e) => ["candidate_message", "persona_message", "fact_revealed"].includes(e.type)),
  },
  {
    id: "D2",
    name: "Framing under Ambiguity",
    prompt: `Assess the problem brief: does it reconcile conflicting stakeholder accounts into one sharp
problem? Does it distinguish symptom (slow clients / staffing) from root cause? Is "what I'm NOT
solving" a real scoping decision? Are assumptions explicit?
${anchors({ 1: "Restates the symptom; no scoping.", 2: "Plausible framing but adopts one stakeholder's view uncritically.", 3: "Root-cause framing grounded in discovered evidence; explicit non-goals.", 4: "Framing reconciles ALL stakeholder conflicts, names what it optimizes for and what it deliberately ignores, with evidence-linked assumptions." })}`,
    slice: (s) => s.trace.filter((e) => ["synthesis_saved", "fact_revealed", "persona_message"].includes(e.type)),
  },
  {
    id: "D3",
    name: "Workflow & Solution Design",
    prompt: `Assess the spec as an agentic WORKFLOW design: multi-step, explicit human-AI handoffs,
decision boundaries, appropriate autonomy (in a regulated audit context, agent actions in sign-off
paths need human approval gates). Grounded in discovered constraints (existing API, pilot history,
regulator timeline) rather than generic.
${anchors({ 1: "'Use AI to fix it' - no workflow.", 2: "Workflow exists but autonomy boundaries vague or governance-naive.", 3: "Clear steps, sign-off gates at the right points, uses discovered constraints.", 4: "Workflow design a reviewer could hand to engineering: boundaries justified, constraints traced to discovery, failure modes addressed." })}`,
    slice: (s) => s.trace.filter((e) => ["spec_saved", "fact_revealed", "build_reply"].includes(e.type)),
  },
  {
    id: "D4",
    name: "Builder Execution",
    prompt: `Assess whether they MADE something real: directed the build agent effectively (specific,
iterative instructions vs one vague dump), reused library components instead of rebuilding,
contributed something back, and improved the prototype after boardroom pushback (test-learn-iterate).
${anchors({ 1: "No real artifact, or one vague build instruction.", 2: "Artifact exists but generic; no reuse; no iteration.", 3: "Concrete artifact, component reuse, visible post-boardroom revision.", 4: "Tight build loop - specific directions, deliberate reuse, contribution back, meaningful iteration that addressed challenges." })}`,
    slice: (s) =>
      s.trace.filter((e) =>
        ["build_prompt", "build_reply", "component_used", "component_contributed", "revision_saved", "boardroom_message"].includes(e.type)
      ),
  },
  {
    id: "D5",
    name: "AI Leverage & Ownership",
    prompt: `Assess HOW they used the AI panel and build agent: augmentation (critique my framing,
generate question ideas they then adapted, pressure-test) vs outsourcing (paste-through of AI output
as their deliverable). Did they edit, reject, redirect AI output? Could they defend it in the
boardroom? Heavy AI use is GOOD if directed and owned - the role does not exist without AI tools.
${anchors({ 1: "Deliverables are verbatim AI output they could not defend.", 2: "Heavy paste-through with light editing.", 3: "AI used as a tool - output visibly transformed, decisions clearly theirs.", 4: "Sophisticated leverage: AI multiplied their judgment (adversarial self-checks, alternative generation) while ownership stayed unmistakably with them." })}`,
    slice: (s) =>
      s.trace.filter((e) =>
        ["panel_query", "panel_reply", "build_prompt", "synthesis_saved", "spec_saved", "boardroom_message"].includes(e.type)
      ),
  },
  {
    id: "D6",
    name: "Responsible AI & Governance",
    prompt: `Assess governance as a DESIGN constraint: sign-off points, audit trail, data boundaries,
regulator awareness (especially if they surfaced the CPAB review), methodology-approval sequencing,
honest risk acknowledgment of their own solution. In a regulated audit firm an agent that cannot
show its reasoning or audit trail is unusable regardless of cleverness.
${anchors({ 1: "Governance absent or waved away.", 2: "Mentioned but bolted on ('add compliance later').", 3: "Concrete guardrails designed in; engages Risk's constraints seriously.", 4: "Governance shapes the design: deployment sequenced around regulatory reality, audit trail + human sign-off architected, candid about residual risks." })}`,
    slice: (s) =>
      s.trace.filter((e) =>
        ["spec_saved", "boardroom_message", "candidate_message", "persona_message", "fact_revealed"].includes(e.type)
      ),
  },
];

export const PROFILES = {
  "senior-consultant": { D1: 0.2, D2: 0.15, D3: 0.2, D4: 0.25, D5: 0.1, D6: 0.1 },
  manager: { D1: 0.15, D2: 0.25, D3: 0.15, D4: 0.1, D5: 0.15, D6: 0.2 },
} as const;
