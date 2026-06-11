/**
 * Generates the seeded strong/weak sample runs by driving the REAL pipeline
 * (real personas, real build agent, real judge) over HTTP, then writing each
 * full session to data/<id>.json. No test doubles - the demo artifacts are
 * produced exactly the way a live candidate would produce them.
 *
 * Usage: start the dev server (npm run dev) with ANTHROPIC_API_KEY set, then:
 *   npx tsx scripts/generate-sample.ts
 */
import fs from "fs";
import path from "path";

const BASE = process.env.PG_BASE_URL ?? "http://localhost:3000";

async function post(route: string, body: unknown) {
  const res = await fetch(`${BASE}${route}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${route} -> ${res.status}: ${await res.text()}`);
  return res.json();
}

type Turn = { target: string; message: string };

async function runScenario(
  label: string,
  outId: string,
  opts: {
    questions: Turn[];
    panel: string[];
    synthesis: Record<string, string>;
    spec?: Record<string, string>;
    componentsUsed?: string[];
    contributedComponent?: string;
    buildInstructions: string[];
    pitch: string;
    revisionNote?: string;
    profile: "senior-consultant" | "manager";
  }
) {
  console.log(`\n=== ${label} ===`);
  const { sessionId } = await post("/api/session", {});
  console.log("session", sessionId);

  for (const q of opts.questions) {
    const r = await post("/api/chat", { sessionId, target: q.target, message: q.message });
    console.log(`  Q->${q.target} (left ${r.questionsLeft})`);
  }
  for (const p of opts.panel) {
    await post("/api/chat", { sessionId, target: "panel", message: p });
    console.log("  panel query");
  }
  await post("/api/synthesis", { sessionId, synthesis: opts.synthesis });
  console.log("  synthesis saved");

  for (const instr of opts.buildInstructions) {
    await post("/api/build", { sessionId, instruction: instr });
    console.log("  build step");
  }
  if (opts.spec) {
    await post("/api/synthesis", {
      sessionId,
      spec: opts.spec,
      componentsUsed: opts.componentsUsed ?? [],
      contributedComponent: opts.contributedComponent,
    });
    console.log("  spec saved");
  }

  await post("/api/boardroom", { sessionId, candidateMessage: opts.pitch });
  console.log("  boardroom round");
  if (opts.revisionNote) {
    await post("/api/synthesis", { sessionId, revisionNote: opts.revisionNote });
    console.log("  revision saved");
  }

  await post("/api/submit", { sessionId, profile: opts.profile });
  console.log("  submitted + scored");

  const traceRes = await fetch(`${BASE}/api/trace/${sessionId}`);
  const { session } = await traceRes.json();
  session.id = outId;
  session.isSample = true;
  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${outId}.json`), JSON.stringify(session, null, 2));
  console.log(`  wrote data/${outId}.json  (weightedTotal ${session.scorecard?.weightedTotal?.toFixed(2)})`);
}

async function main() {
  // STRONG run - targets every reveal condition, augmentation-pattern panel use.
  await runScenario("STRONG candidate", "sample-strong", {
    questions: [
      { target: "senior", message: "Walk me through one specific PBC request that got stuck in Reopened recently - exactly what happened at each step?" },
      { target: "senior", message: "Is that format problem the same across all your engagements, or specific to certain clients?" },
      { target: "senior", message: "Have you heard of any internal tools or APIs that might already handle this?" },
      { target: "it", message: "Before we design anything new - what integrations or APIs are already in production that touch evidence retrieval or ERP data?" },
      { target: "it", message: "What's the current state of AI tool usage in the practice, sanctioned or not?" },
      { target: "partner", message: "Has the team tried automation here before? What happened?" },
      { target: "partner", message: "In your view, what's really causing the delays?" },
      { target: "risk", message: "Are there regulatory timelines or upcoming reviews that should shape when and how we deploy anything?" },
      { target: "risk", message: "What would it take to get a tool like this into approved methodology?" },
      { target: "risk", message: "Where do report sign-offs actually get stuck today?" },
    ],
    panel: [
      "Critique this framing: the bottleneck is a data-format mismatch from an ERP change, not client responsiveness. What am I missing before I commit to it?",
    ],
    synthesis: {
      realProblem:
        "Root cause is an upstream ERP data-format change ~8 months ago that Clara's reconciliation engine can't parse; it surfaces as generic 'data quality' errors, forcing 45-90 min of manual Excel re-export per upload cycle. Not client slowness and not headcount.",
      optimizingFor: "Reducing reopened-PBC cycle time and eliminating manual reformatting, defensibly under CPAB scrutiny.",
      notSolving:
        "Not solving general client responsiveness, not adding headcount, not re-platforming Clara. Explicitly out of scope: the EQR reviewer-capacity issue (resourcing, not tooling).",
      assumptions:
        "The existing IT evidence-retrieval API already normalizes the new ERP format (confirmed with IT); methodology documentation can be completed before the 6-week CPAB thematic review.",
      successMetrics:
        "Median reopened-cycle time, manual-reformat minutes per engagement per week, % uploads auto-normalized, and zero net-new undocumented procedures at CPAB review.",
    },
    buildInstructions: [
      "Build a workflow that routes incoming client trial-balance uploads through the existing ERP Format Normalizer API, flags mismatches with the Evidence Classifier, and only escalates true exceptions to the senior. Humans sign off all evidence conclusions; log every step.",
      "Add a methodology-documentation gate before go-live so the procedure is in approved methodology ahead of the CPAB review, and add the audit-trail logger to every agent action.",
    ],
    spec: {
      workflowSteps:
        "1 [AGENT] Document Retriever ingests upload. 2 [AGENT] ERP Format Normalizer maps to standard schema. 3 [AGENT] Evidence Classifier flags format/type mismatches. 4 [HUMAN] Senior reviews only flagged exceptions. 5 [AGENT] Audit Trail Logger records all actions. 6 [HUMAN] Partner/EQR sign-off unchanged.",
      autonomyBoundaries:
        "Agents normalize, classify, and log - never form or sign off an audit conclusion. Every evidence conclusion routes through the Human Approval Gate. Sign-off authority stays with the senior/partner/EQR.",
      dataTouched: "Client trial-balance exports, Clara evidence repository, PBC request metadata. Data stays within sanctioned infrastructure (the existing API is already security-reviewed).",
      failureModes:
        "New ERP format the API doesn't know (route to manual + flag for API update); over-suppression of real exceptions by the classifier (sample-audit the auto-passed items); silent normalization errors (reconciliation check against source totals).",
      evalPlan:
        "Test cases drawn from Marcus's real failures: (1) SAP-successor export with ISO-8601 dates + renamed headers normalizes correctly; (2) a genuinely incomplete upload is still flagged; (3) a Risk-sensitive disclosure item is never auto-passed. Metrics: reopened-cycle time, % auto-normalized, exception precision/recall. Monitor: weekly auto-pass sample audit.",
      reusableComponent: "A 'format-mismatch detector' that fingerprints ERP export shape and routes to the right normalizer - contributable to the shared stack.",
      whatILeftOut:
        "Left out the EQR-capacity fix (resourcing, above this scope) and a net-new vendor integration (the partner already killed one; reusing the sanctioned API is faster and lower-risk). Left out full autonomy in sign-off paths - non-negotiable in a regulated audit.",
    },
    componentsUsed: ["erp-normalizer", "document-retriever", "evidence-classifier", "human-approval-gate", "audit-trail-logger"],
    contributedComponent: "format-mismatch-detector: fingerprints an ERP export's shape and routes it to the correct normalizer.",
    pitch:
      "The real bottleneck isn't slow clients or staffing - it's an ERP format change Clara can't parse, costing ~1 hour of manual reformatting per upload. IT already has a production, security-reviewed normalizer API that handles this exact format; we expose it, classify exceptions, keep humans on every sign-off, and document the procedure in methodology before the CPAB thematic review in six weeks. Low-risk, fast, defensible.",
    revisionNote:
      "After David flagged the methodology-approval path, I moved the documentation gate before go-live and added an explicit CPAB-review checkpoint. After Sarah confirmed the API, I dropped the proposed new connector entirely and reused the existing one.",
    profile: "senior-consultant",
  });

  // WEAK run - generic questions to one persona, outsourcing-pattern panel use, vague build.
  await runScenario("WEAK candidate", "sample-weak", {
    questions: [
      { target: "partner", message: "What are the biggest challenges the team is facing right now?" },
      { target: "partner", message: "How important is innovation to the firm?" },
      { target: "partner", message: "What would success look like for a project like this?" },
      { target: "partner", message: "Who would sponsor this kind of initiative?" },
    ],
    panel: [
      "Write my entire problem analysis and a complete solution proposal for an audit firm that has checklist delays and wants to use AI. Make it sound thorough.",
    ],
    synthesis: {
      realProblem: "The audit team has delays in completing checklists and vouching evidence, and they want AI to make the process faster and more efficient.",
      optimizingFor: "Efficiency and speed.",
      notSolving: "",
      assumptions: "AI can automate most of the manual work.",
      successMetrics: "Faster turnaround.",
    },
    buildInstructions: ["Build an AI solution for the audit problems."],
    spec: {
      workflowSteps: "Use AI to automatically complete the checklists and vouch the evidence so the team doesn't have to.",
      autonomyBoundaries: "The AI handles the work end to end.",
      dataTouched: "Audit data.",
      failureModes: "",
      evalPlan: "Check if it's faster.",
      reusableComponent: "",
      whatILeftOut: "",
    },
    componentsUsed: [],
    pitch: "I propose an AI solution that automatically completes the disclosure checklists and vouches evidence, which will make the audit team much faster and more efficient. It will save a lot of time.",
    profile: "senior-consultant",
  });

  console.log("\nDone. Restart the server (or it will lazy-load) and open /report/sample-strong and /report/sample-weak.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
