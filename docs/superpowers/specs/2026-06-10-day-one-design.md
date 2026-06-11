# Day One - Design Spec
**A simulated KPMG AI-Lab engagement that evaluates AI Builder candidates end-to-end**

Date: 2026-06-10
Status: Draft for review
Author: Udbhav Kansal (with Claude as design partner; all decisions human-approved)

---

## 0. One-line definition

A hosted web app that drops an AI Builder candidate into a simulated enterprise engagement - they discover a problem by interviewing conflicting LLM-played stakeholders, scope it, build a real prototype in an in-app builder studio, defend it in a boardroom group chat, and iterate - while an LLM judge scores the **entire work trace** against a JD-derived rubric with cited evidence and human sign-off.

---

## 1. Problem framing (why this, not something else)

### 1.1 The reframe
The brief asks: "help the hiring team identify strong AI Builder candidates." The naive read is *screen resumes faster*. We reject that. The AI Builder role is defined by behaviors that are nearly invisible in resumes, portfolios, and standard interviews:

- How someone moves from a vague prompt to a sharp problem (the brief's own words: "how you scope the problem, what you choose to optimize for, the choices you make, and the ones you deliberately do not").
- Whether they ask the right questions of the right people. **Core thesis: with AI, answers have become cheap; questions have become expensive.** The scarce skill is knowing what to ask, of whom, and when to stop.
- Whether they use AI to *augment* understanding or to *outsource* it (brief: "you can outsource thinking, you cannot outsource understanding").
- Whether governance is instinct or afterthought (KPMG Trusted AI: every published KPMG agent deployment - Clara, One Port, Kleo, Workbench - retains mandatory human-in-the-loop sign-off).

So instead of evaluating *artifacts about past work*, we evaluate *observed behavior on representative work*: a work-sample simulation. This is also the most defensible instrument in hiring science (work samples are among the strongest predictors of job performance) and the most auditable: every score traces to a logged behavior.

### 1.2 Assessment-fidelity principle
A solo 60–90 minute simulation cannot honestly test the full JD. We do not pretend it does. The design maps every JD line to either (a) a simulation mechanic that observes it, or (b) an explicit out-of-scope declaration routed to another funnel stage (behavioral interview, references, paired build). Faking coverage would itself violate the brief's bar for honest tradeoff communication. See §6 coverage matrix.

---

## 2. Candidate journey - one continuous engagement

The journey mirrors the actual AI Builder lifecycle from the JD: **discover → frame → build → validate → iterate → hand off.** Each phase produces trace data the judge consumes. Nothing is a disconnected mini-game; each phase's output is the next phase's input.

### Phase 0 - Engagement brief (2 min)
Candidate receives a thin, deliberately ambiguous brief, modeled on a real KPMG internal context (grounding: KPMG-real, per decision). Example scenario (v1 ships one):

> **"Maple & Birch LLP" (a KPMG-like professional services firm).** The audit practice's engagement teams are missing internal deadlines on disclosure-checklist completion and evidence vouching. Partners blame staffing; staff blame the tools; IT blames data access; Risk is nervous about a regulator review in 8 weeks. Leadership wants to know "where AI agents could help." Find the real problem and propose + prototype what to build.

Why this scenario: it mirrors KPMG's actual live agent deployments (Clara's expense-vouching and disclosure-checklist agents), so a candidate's solution can be benchmarked against what KPMG really built - without requiring audit domain expertise to engage (the pain points are universal: deadlines, handoffs, data access, governance).

### Phase 1 - Discovery (stakeholder interviews)
Candidate interviews 4 LLM-played personas, each seeded with:
- **Public stance** (what they volunteer),
- **Hidden facts** (tagged `critical / useful / noise`, surfaced only under good questioning),
- **Conflicts** (each persona's priorities contradict at least one other's),
- **Spin** (what they exaggerate or withhold - per mentor-insight slot, tunable).

V1 personas:
1. **Engagement Partner** (revenue + quality sign-off pressure; hides: she already rejected an automation pilot last year and why).
2. **Audit Senior** (the messy operational reality; hides: the checklist rework is caused by upstream data format changes, not effort).
3. **IT / Platform lead** (integration constraints; hides: a sanctioned API + component already exists for evidence retrieval).
4. **Risk & Quality lead** (governance; hides: the regulator review scope - which makes some automation ideas radioactive and others safe).

**Turn budget:** candidate gets a capped number of total questions (e.g. 20) across all personas, visible as a countdown. Forces triage; makes "what you leave out" and question economy directly observable.

### Phase 2 - Synthesis (problem brief)
Structured form, kept light: *the real problem (vs. presenting symptom) · who is affected · what I'm optimizing for · what I'm explicitly NOT solving and why · key assumptions · success metrics.*
The hidden-facts ledger lets the judge verify whether the synthesis rests on discovered evidence or invention.

### Phase 3 - Build (Builder Studio)
The candidate builds a **real prototype**, not a slideware description. The studio contains:

1. **Guided spec scaffold** - short structured spec before code: workflow steps, where agents act vs. where humans decide (autonomy boundaries + sign-off points, mirroring KPMG's mandatory human-in-the-loop), data touched, failure modes, **evaluation plan** (see below), TACO-style agent classification (Tasker/Automator/Collaborator/Orchestrator) as an optional vocabulary aid.
2. **Agentic coding tool** - embedded Claude-powered build agent. The candidate directs it to generate/modify a working prototype (v1 target: a runnable agent workflow demo inside a sandboxed pane). **Every prompt to the build agent is logged** - this is the richest "augment vs. outsource" signal in the system.
3. **Component library** - 5–8 pre-built, documented components (e.g. `document-retriever`, `checklist-engine`, `human-approval-gate`, `audit-trail-logger`, `evidence-classifier`). Tests the JD's "contribute reusable skills / start further ahead" both ways: do they *reuse* instead of rebuilding, and do they *mark* one of their own pieces as reusable-back-to-stack (one-click "contribute back" with a description)?
4. **Evaluation plan requirement** *(mechanism for the JD's "design evaluations")*: candidate must define how they'd know the agent works - success metrics, 3+ concrete test cases, failure modes, monitoring signal. **Design link:** the strongest eval plans will reuse facts discovered in Phase 1 (e.g. the Senior's data-format edge cases become test cases; Risk's regulator constraints become guardrail tests). The judge explicitly checks discovery→eval traceability. This makes "designing evaluations" a measured behavior, not a checkbox.

### Phase 4 - Boardroom (group-chat defense)
Candidate posts their proposal + prototype into a group chat with **all personas at once**. Personas challenge in-character: assumptions, tradeoffs, risks, cost, adoption, governance (Partner: "who signs off?"; Risk: "what does the regulator see?"; IT: "you rebuilt our existing API?"). This observes, live: communication of assumptions/tradeoffs/risks, handling competing priorities simultaneously (vs. one-at-a-time in discovery), demo readiness, and composure under pushback.

### Phase 5 - Iterate + per-persona review
After the boardroom, the candidate may revise the prototype/spec (test → learn → iterate, JD-explicit). Each persona then "walks through" the revised prototype individually and leaves structured reactions tied to their needs. Candidate submits final package: problem brief + spec + prototype + eval plan + a short "what I'd do with more time" note.

### Throughout - the AI Panel
A general-purpose AI assistant available in every phase, separate from the build agent. Usage logged verbatim. Using it heavily is **not** penalized - the JD says the role "does not exist without" AI tools. What's scored is the *pattern*: augmentation (critique my framing, generate question lists, pressure-test assumptions) vs. outsourcing (write my problem brief; the candidate pastes output unread). Decision-ownership signals: does the candidate edit, reject, and redirect AI output, or relay it?

### Flow integrity (the "smooth flow" requirement)
Discovery facts → cited in problem brief → constraints in spec → encoded as eval test cases → defended in boardroom → revised in iteration. Each arrow is a traceability edge the judge can check. A candidate who skips a phase produces visible breaks in the chain; that absence is itself signal.

---

## 3. The rubric

Six dimensions + a governance gate. Every dimension scored 1–4 (Insufficient / Developing / Strong / Exceptional). **Every score must cite specific trace evidence** (message IDs, spec excerpts, AI-panel logs). Two weight profiles over identical dimensions (Senior Consultant vs Manager) since the brief covers both levels.

| # | Dimension | What it measures | Primary trace evidence | JD/Brief anchor |
|---|---|---|---|---|
| D1 | **Discovery & Question Quality** *(headline)* | Right question → right person; surfaces hidden critical facts; signal-per-question economy under turn budget; detects spin/conflict | Interview transcripts vs. hidden-facts ledger; turn-budget usage | "identify real pain points, constraints"; questions-are-expensive thesis |
| D2 | **Framing under Ambiguity** | Reconciles conflicting stakeholders into one sharp problem; explicit about what's optimized and what's deliberately ignored; assumptions stated, not smuggled | Problem brief; deltas between symptom (brief) and diagnosis | Brief: "turn ambiguity into concrete direction"; "choices you deliberately do not make" |
| D3 | **Workflow & Solution Design** | Multi-step workflow with human-AI handoffs, decision boundaries, appropriate autonomy; grounded in discovered constraints, not generic | Spec scaffold; autonomy/sign-off design; constraint traceability | JD verbatim: "think in workflows, not just models" |
| D4 | **Builder Execution** | Makes something real; directs the build agent effectively; reuses components instead of rebuilding; contributes back; prototype actually reflects the spec | Builder Studio logs; prototype diff history; component reuse/contribution events | "builder mindset: create, don't describe"; "reusable skills back into the shared stack" |
| D5 | **AI Leverage & Ownership** | Augments rather than outsources; edits/rejects/redirects AI output; can defend every AI-assisted decision as their own; transparent about use | AI-panel logs; build-agent prompt patterns; boardroom answers vs. AI-generated content | Brief: "outsource thinking ≠ outsource understanding" |
| D6 | **Responsible AI & Governance** | Risk/governance/trust as design constraints from the start: sign-off points, audit trail, data boundaries, regulator awareness; honest about own solution's risks | Spec guardrails; eval plan failure modes; responses to Risk persona | JD: "risk, governance, ethics, trust as core design constraints, not afterthoughts"; KPMG Trusted AI |

**Cross-cutting (assessed inside every dimension, not a 7th score):** communication clarity - assumptions, tradeoffs, risks, next steps (Brief look-for #5). Evidence: synthesis quality, boardroom performance, "more time" note.

**Test-learn-iterate** is scored inside D4 (did the prototype/spec actually improve post-boardroom?) with supporting evidence in D2 (did the framing absorb new information?).

### Governance gate (caps total score regardless of dimensions)
Red flags, any one of which caps the overall rating:
- Fabricates stakeholder facts or data that contradict the trace.
- Proposes fully-autonomous agents in regulated sign-off paths after the Risk persona has flagged the constraint (governance-deaf).
- Wholesale AI-generates the deliverable and cannot defend it in the boardroom (outsourced understanding).
- Ignores the turn budget / games the simulation rather than engaging the problem.

### Level profiles
- **Senior Consultant:** D1 20% · D2 15% · D3 20% · D4 25% · D5 10% · D6 10%. Hands-on: discovery, design, build dominate.
- **Manager:** D1 15% · D2 25% · D3 15% · D4 10% · D5 15% · D6 20%. Judgment at scale: framing, prioritization, governance, AI-ownership dominate. (Boardroom weight rises via D2/D6 evidence.)

Weights are starting points, explicitly marked for calibration against real hiring outcomes (see §7 risks).

---

## 4. The judge

**Architecture: LLM judge proposes, human decides** (mirrors KPMG's own human-in-the-loop stance - the evaluation system practices what it scores).

1. **Per-dimension scoring passes** - one judge call per dimension, fed only that dimension's relevant trace slices + rubric anchors, returning: score, confidence, 3–5 cited evidence snippets (with trace IDs), and counter-evidence it considered.
2. **Hidden-facts audit** - deterministic (non-LLM) computation: which critical/useful facts surfaced, question count per persona, component reuse events, iteration deltas. Hard numbers anchor the soft scores.
3. **Scorecard assembly** - weighted profile + gate check + a "for the human reviewer" section: lowest-confidence scores flagged first, with direct links into the trace for spot-checking.
4. **Human sign-off** - the reviewer confirms or overrides each dimension; overrides are logged with reasons. The artifact's audit trail is itself a Trusted-AI demonstration.

**Judge fairness guardrails (v1):** judge never sees candidate name/background; scores cite evidence or are rejected; rubric anchors include explicit "different-but-valid paths" notes (e.g., a UX-background candidate may discover via different question styles than an engineer - anchors reward *outcome* signals like critical-fact coverage, not style mimicry).

---

## 5. Build slice for the 3-hour cap

The brief rewards visible scoping. Three tiers, stated in the README and video:

**BUILT (runnable, hosted):**
- Next.js app on Vercel, Claude API backend.
- One scenario (Maple & Birch audit-workflow case), 4 personas with hidden-fact ledgers, turn budget.
- AI Panel (logged), Synthesis form, Builder Studio **lean**: spec scaffold + build-agent chat producing a real artifact (v1: working workflow definition + runnable demo stub; not a full code sandbox) + component library as selectable, documented blocks.
- Boardroom group chat (all personas, in-character challenge).
- Judge pipeline: per-dimension scoring with cited evidence + hidden-facts audit + scorecard UI with human-override controls.
- 2 seeded sample runs (one strong, one weak) so reviewers and the video can show the judge **discriminating** without waiting on a live session.

**DESCRIBED (in README/spec, deliberately not built):**
- Per-persona individual prototype walkthrough reviews (Phase 5's full form - v1 collapses this into the boardroom + one revision round).
- Scenario library, Manager-level scenario variants, calibration tooling, proctoring/anti-cheat, ATS integration.

**OUT OF SCOPE (routed elsewhere in the funnel, with rationale):**
- People leadership/coaching (Manager JD) → behavioral interview + references. A solo sandbox cannot honestly observe it.
- Engineering craft / production hardening → paired-build or code-review stage. This instrument tests build *judgment*, not build *craft*, and says so.
- Long-horizon ownership (maintenance, change management, adoption) → behavioral evidence + work history.

---

## 6. Coverage matrix (every brief/JD line → mechanism)

| Requirement (source) | Mechanism | Status |
|---|---|---|
| Understand role + hiring challenge (Brief) | This framing doc; scenario grounded in KPMG's real agent deployments | ✅ |
| Ambiguity → concrete direction (Brief, JD) | Thin brief; conflicting personas; D2 | ✅ |
| Practical, usable artifact grounded in job context (Brief) | Working prototype in Builder Studio; KPMG-real scenario | ✅ |
| Builder mindset - make something real (Brief, JD) | Agentic coding tool; D4 | ✅ |
| Assumptions/tradeoffs/risks/next steps (Brief) | Synthesis form fields; boardroom challenge; cross-cutting scoring | ✅ |
| Responsible AI: fairness, governance, transparency, candidate experience (Brief) | D6 + gate; judge guardrails; human sign-off; candidate sees their own scorecard | ✅ |
| Identify pain points/constraints/opportunities (JD) | Hidden-facts discovery; D1 | ✅ |
| Enterprise fluency (JD) | Persona targeting (right question, right person); D1 | ✅ |
| Workflows not models; handoffs, boundaries, autonomy (JD) | Spec scaffold requires them; D3 | ✅ |
| Code/config/low-code/APIs/orchestration (JD) | Build agent + components = orchestration-style building | ✅ |
| Reasonable assumptions, build, test, learn, iterate (JD) | Boardroom → revision loop; iteration deltas in D4 | ✅ |
| Design evaluations (JD, Sr Consultant) | Mandatory eval plan with discovery→eval traceability | ✅ |
| Risk/governance/ethics/trust as design constraints (JD) | Risk persona; D6; gate | ✅ |
| Competing stakeholder priorities (Brief closing quote) | Conflicting personas; boardroom simultaneous challenge | ✅ |
| High-impact prioritization, measurable outcomes (JD, Manager) | Success metrics required; turn budget forces triage; D2 | ✅ |
| Speed vs judgment; what you leave out (Brief, JD) | Turn budget; "NOT solving" field; "more time" note | ✅ |
| Reusable components to shared stack (JD) | Component library reuse + contribute-back | ✅ |
| Demo readiness, narrative, governance checks (JD, Manager) | Boardroom defense | ✅ (lite) |
| Full lifecycle incl. productionize/maintain (JD) | Out of scope - declared, routed to funnel | ⬜ declared |
| Lead/coach/develop teams (JD, Manager) | Out of scope - behavioral stage | ⬜ declared |

---

## 7. Risks & responsible-AI honesty (to be stated in submission)

1. **LLM judge bias/variance** - mitigations: evidence-citation requirement, deterministic hidden-facts audit as anchor, human sign-off, name-blind scoring. Residual risk stated openly: unvalidated against real hiring outcomes; v1 is a *decision-support* tool, never an auto-rejector. This stance mirrors KPMG's published position that no hiring decisions are made by AI.
2. **Construct validity** - does question-quality-in-sim predict on-the-job performance? Unproven. Next step: calibration runs with current AI Builders as benchmark candidates.
3. **Gaming/familiarity** - candidates who've seen similar sims gain advantage; scenario library + fact randomization mitigates later.
4. **Candidate experience** - a 60–90 min sim is a real ask; mitigated by making it genuinely engaging (the strongest candidates *want* representative work samples) and by showing candidates their own scorecard (transparency as a feature).
5. **Accessibility/fairness across backgrounds** - chat-based interface advantages strong written-English candidates; anchors reward outcomes not style; flagged for review with KPMG's inclusion standards before any real use.
6. **Cost/latency** - multi-persona + judge calls per session; lean prompts, cached persona contexts, capped turns.

---

## 8. Tech notes (v1)

- **Stack:** Next.js (App Router) + Vercel hosting; Anthropic API (Claude) for personas, AI panel, build agent, judge. No DB in v1 - session state server-side in-memory/KV + JSON trace export; seeded runs as static JSON.
- **Trace schema:** every event `{phase, actor, type, content, ts, refs[]}` - single append-only log powers judge slicing, hidden-fact audit, and reviewer drill-down.
- **Personas:** one system prompt each = role + public stance + hidden-fact ledger + spin rules + reveal conditions ("reveal F3 only if asked about upstream data sources").
- **Keys:** server-side env vars only; demo deploy rate-limited; no candidate PII collected in demo.

---

## 9. Submission package mapping

- **Artifact:** hosted app URL + GitHub repo (README = run instructions + this spec + scoping rationale).
- **Video (3 min):** 1 min - live walkthrough: discovery → studio → boardroom → scorecard with cited evidence (using seeded strong/weak runs). 2 min - framing (questions-expensive thesis), key choices, what was cut and why, rubric→JD mapping, risks, exact AI-use disclosure (which decisions were whose).
- **PDF (`Udbhav_Kansal_AIBuilder.pdf`):** 1-pager - problem framing, system diagram, rubric table, coverage matrix summary, risks, links.
