# Day One

**A simulated KPMG AI-Lab engagement that evaluates AI Builder candidates by capturing how they work, not what they claim.**

A candidate is dropped into an ambiguous enterprise problem at a fictional Big-Four-affiliate firm, interviews four LLM-played stakeholders who hold conflicting and partial information, scopes the real problem, designs and prototypes a solution with an embedded build agent, and defends it in a boardroom. An LLM judge then scores the entire work-trace against a rubric derived from the AI Builder job description — every score cites trace evidence, a deterministic audit anchors the soft scores, and a human reviewer signs off.

> Built as a 3-hour case-study artifact. The point is not polish; it is to show how a vague prompt ("help us evaluate AI Builders") becomes a concrete, defensible system — and what was deliberately left out.

---

## Why this, and not a résumé screener

The AI Builder role is defined by behaviors that résumés and standard interviews can't see: how someone moves from a vague prompt to a sharp problem, whether they ask the right question of the right person, and whether they use AI to *augment* their understanding or *outsource* it. So instead of evaluating artifacts about past work, this evaluates **observed behavior on representative work** — a work-sample simulation, the strongest known predictor of job performance and the most auditable (every score traces to a logged behavior).

Core thesis baked into the scoring: **with AI, answers are cheap; questions are expensive.** The scarce skill is knowing what to ask, of whom, and when to stop — so the headline rubric dimension measures exactly that, against a 20-question budget.

---

## The candidate journey (one continuous, recorded engagement)

```
 Brief ─► Discovery ─► Synthesis ─► Build ─► Boardroom ─► Iterate ─► Submit
            │            │           │          │            │          │
       4 personas    problem     spec + build  all personas  revise   LLM judge
       hidden facts   brief      agent + parts  challenge     spec    + human sign-off
       20-Q budget                library       at once
            │                                                            │
            └──────────────── every action appended to ONE trace ───────┘
                                                                         │
        AI Panel (logged, always available) ─────────────────────────────
```

1. **Discovery** — interview Rachel (Partner), Marcus (Senior), Sarah (IT), David (Risk). Each holds *hidden facts* that surface only under the right question (e.g. the real root cause is an ERP data-format change the Senior never escalated; IT already has a production API that solves it; a regulator review is six weeks out). A 20-question budget forces triage.
2. **AI Panel** — an always-available assistant. Using it heavily is fine; *how* you use it (augment vs. outsource) is scored.
3. **Synthesis** — a sharp problem brief: real problem vs. symptom, what you optimize for, what you deliberately don't solve.
4. **Build** — direct an embedded build agent, reuse a component library instead of rebuilding, write a spec with explicit human-AI handoffs and an evaluation plan.
5. **Boardroom** — pitch to all four stakeholders at once; they challenge assumptions, cost, governance; a persona may pointedly reveal a fact you missed. Then revise.
6. **Submit** — the judge scores the full trace.

---

## Architecture

- **Next.js 16 (App Router) + TypeScript**, no database. All session state lives in one server-side append-only **trace** (`TraceEvent[]`) — the single source of truth the judge consumes.
- **Hidden-fact marker protocol.** Persona prompts append an invisible `⟦HF-n⟧` token when a hidden fact is revealed. The server strips it (never shown to the candidate) and records it. This turns "question quality" from a vibe into a **deterministic measurement**: which critical facts surfaced, from whom, in how many questions.
- **Model tiering** (right model for the task): **Claude Sonnet 4.6** drives the in-character personas, AI panel, and build agent (fast, low-latency, cheap per turn); **Claude Opus 4.8** runs the boardroom (multi-persona coherence) and the judge (scoring quality and defensibility).
- **The judge** = six parallel Claude calls (one per rubric dimension, each seeing only its evidence slice, returning a score + confidence + cited evidence + counter-evidence via structured output) + a deterministic audit (facts found, question economy, reuse, iteration — hard numbers that anchor the soft scores) + a governance-gate check + weighted assembly. **The LLM proposes; a human reviewer signs off** — every override is logged to the trace, so the evaluation system itself keeps the audit trail it scores candidates against.

```
lib/
  types.ts             trace + scorecard types
  store.ts             in-memory session store, question budget, fact recording  (unit-tested)
  scenario.ts          the Maple & Birch case + hidden-facts ledger
  personas.ts          4 research-grounded personas + system-prompt builder
  markers.ts           marker extraction                                          (unit-tested)
  rubric.ts            6 dimensions, 1-4 anchors, evidence slices, weight profiles
  judge.ts             parallel evidence-cited judge + audit + gate + assembly     (unit-tested)
  components-library.ts  pre-built parts the candidate reuses / contributes to
app/api/                session, chat, build, synthesis, boardroom, submit, trace, override
app/                    landing, sim workspace, scorecard report
scripts/generate-sample.ts  drives the REAL pipeline to produce the demo runs
```

---

## The rubric (mapped to the job description)

Six dimensions, each scored 1-4 with cited evidence; two weight profiles (Senior Consultant vs. Manager) over the same dimensions; a governance gate that caps the total on disqualifying behavior.

| Dim | Measures | JD / brief anchor |
|----|----------|-------------------|
| **D1 Discovery & Question Quality** *(headline)* | right question to right person; critical facts surfaced; signal-per-question under budget | "identify real pain points, constraints"; questions-are-expensive |
| **D2 Framing under Ambiguity** | reconciles conflicting stakeholders into a sharp problem; symptom vs. root cause; explicit non-goals | "turn ambiguity into a concrete direction" |
| **D3 Workflow & Solution Design** | multi-step workflow, human-AI handoffs, appropriate autonomy, grounded in discovered constraints | "think in workflows, not just models" |
| **D4 Builder Execution** | makes something real; reuses components; iterates after pushback | "builder mindset: create, don't describe"; "reusable skills back to the stack" |
| **D5 AI Leverage & Ownership** | augments vs. outsources; edits/redirects AI output; can defend it | "you can outsource thinking, you cannot outsource understanding" |
| **D6 Responsible AI & Governance** | governance as a design constraint: sign-off, audit trail, data boundaries, regulator awareness | "risk, governance, ethics, trust as core design constraints" |

**Governance gate** (caps the score regardless of dimensions): fabricating facts, fully-autonomous agents in regulated sign-off paths after Risk flagged it, wholesale AI-generated deliverables with no defense, or gaming the simulation.

---

## Scope — what's built vs. described vs. out

A solo 60-90-minute simulation cannot honestly test the entire JD. Pretending it does would fail the brief's own bar for honest tradeoffs, so:

- **BUILT (runnable here):** the full loop — one scenario, 4 personas with hidden-fact ledgers, 20-question budget, AI panel, Builder Studio (spec + build agent + component library), boardroom, and the evidence-cited judge with human-override controls + deterministic audit. Plus two seeded sample runs (strong + weak) generated through the real pipeline.
- **DESCRIBED, not built (deliberate cuts):** per-persona individual prototype walkthroughs (collapsed into the boardroom + one revision round); a scenario library and Manager-level variants; calibration tooling; proctoring/anti-cheat.
- **OUT OF SCOPE (routed elsewhere in the funnel, on purpose):** people leadership/coaching (behavioral interview), engineering craft / production hardening (paired build / code review — this tests build *judgment*, not build *craft*), and long-horizon ownership (work history). A solo sandbox can't observe these without faking signal.

---

## Risks & responsible-AI honesty

- **LLM-judge bias/variance** — mitigated by required evidence citations, a deterministic audit anchor, name-blind scoring, and mandatory human sign-off. This is a **decision-support tool, never an auto-rejector** — mirroring KPMG's published stance that no hiring decision is made by AI.
- **Construct validity** — does question-quality-in-sim predict on-the-job performance? Unproven; next step is calibration runs with current AI Builders as benchmark candidates.
- **Fairness across backgrounds** — anchors reward *outcomes* (facts surfaced, anomalies probed), not a particular question style; chat interface advantages strong written English (flagged for review before any real use).
- **Gaming / familiarity** — scenario library + fact randomization needed before repeat use.

---

## Run it

```bash
cd proving-ground
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local   # an Anthropic API key
npm install
npm run dev                                          # http://localhost:3000
npm test                                             # unit tests for store / markers / judge assembly
```

Open `/` to start a live session, or jump straight to the seeded scorecards: **`/report/sample-strong`** (4.00, all 4 critical facts) and **`/report/sample-weak`** (1.00, governance gate triggered). To regenerate the samples through the real pipeline: with the dev server running, `npx tsx scripts/generate-sample.ts`.

> **Known limitation:** session state is in-memory. On serverless hosting a *live* run can reset between function invocations; the seeded sample reports read from committed `data/*.json` and always work. For a full live session end-to-end, run locally.

---

## How AI was used (disclosure)

The framing, the rubric design, the hidden-fact mechanism, the model-tiering decision, the scope cuts, and the persona ground-truth were **my** decisions. AI was used as a build accelerator: research (audit-firm dynamics, PCAOB/CPAB/Clara specifics — all persona facts are cited to primary sources in `../docs/persona-dossiers.md`), code generation against my spec and plan (`../docs/superpowers/`), and as the runtime engine. Every architectural and evaluation-design choice is one I can defend.
