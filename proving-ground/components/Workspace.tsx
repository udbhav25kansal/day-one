"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { COMPONENT_LIBRARY } from "@/lib/components-library";
import ReviewerGuide from "@/components/ReviewerGuide";

// Minimal typings for the browser Web Speech API (not in lib.dom for all targets).
interface SRResult {
  isFinal?: boolean;
  0: { transcript: string };
}
interface SREvent {
  results: { length: number; [index: number]: SRResult };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}
type SRConstructor = new () => SpeechRecognitionLike;
function getSR(): SRConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

// Client-safe roster ONLY - names/titles/public bio/tint. Never import PERSONAS here;
// it holds the hidden facts and would ship the answers to the browser bundle.
const ROSTER = [
  {
    id: "partner",
    name: "Rachel Chen",
    title: "Engagement Partner",
    opening:
      "Thanks for making the time. Rachel Chen, I'm the engagement partner on a chunk of our audit accounts. Quick context for why you're here: my teams keep slipping our internal deadlines on the disclosure checklists and the evidence work, and leadership wants to know whether AI agents could genuinely help. I care about quality and not blowing up our delivery rhythm in the process. Where would you like to start?",
    tint: "var(--lavender)",
    deep: "var(--lavender-deep)",
  },
  {
    id: "senior",
    name: "Marcus Webb",
    title: "Senior Associate",
    opening:
      "Hey, good to meet you. Marcus, senior associate. I run the day to day on three public-company audits right now - the client request list, the workpapers, the disclosure checklist, all of it. So this deadline problem everyone's talking about, I'm kind of the one living in it. Ask me whatever's useful.",
    tint: "var(--sage)",
    deep: "var(--sage-deep)",
  },
  {
    id: "it",
    name: "Sarah Okafor",
    title: "IT / Platform Lead",
    opening:
      "Hi - Sarah Okafor. I look after the audit platform and our integrations, and I own the security-review process for anything new. I gather there's interest in AI tooling for the audit teams. Happy to help; I'll just want to understand what data and systems we'd actually be touching. What did you want to walk through?",
    tint: "var(--sky)",
    deep: "var(--sky-deep)",
  },
  {
    id: "risk",
    name: "David Osei",
    title: "Risk & Quality Lead",
    opening:
      "Good to meet you. David Osei, audit quality and professional practice. My role, simply put, is making sure whatever we do holds up in front of the regulator. I'm not against innovation at all - it just has to be defensible. Tell me what you're considering and I'll tell you what the path to doing it properly looks like.",
    tint: "var(--peach)",
    deep: "var(--peach-deep)",
  },
] as const;

// Real-life timing: each stakeholder conversation is time-boxed. Candidate can move
// on early, and runs out automatically. Tunable.
const DISCOVERY_SECONDS = 600; // 10 minutes per stakeholder

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

// ?demo=1 pre-fills every candidate field with the strong-run content so a
// presenter can click through fast without typing. Pure presentation aid; the
// pipeline and scoring are identical to a normal session.
const DEMO_QUESTIONS: Record<PersonaId, string> = {
  partner: "Has the team tried automation here before? What happened with it?",
  senior:
    "Take me through one upload that recently got reopened, step by step. What actually broke, and is it every client or only some of them?",
  it: "Before we design anything new, what integrations or APIs are already in production that touch evidence retrieval or ERP data normalization?",
  risk: "Are there any regulatory timelines or upcoming reviews that should shape when and how we deploy this?",
};

// Canned in-character answers so demo mode shows the full conversation, with the
// reveal already on screen, no waiting on the model. (Live sessions get real replies.)
const DEMO_ANSWERS: Record<PersonaId, string> = {
  partner:
    "Honestly? We tried this before, about eighteen months ago. A vendor tool that promised it would plug into Clara. The integration dragged on five months, security made us re-scope the data twice, and we lost three weeks of busy season cleaning it up. I killed it. So forgive me if I'm wary of another integration project.",
  senior:
    "Okay, one specific one. My biggest client moved off SAP about eight months ago onto a cloud ERP, and ever since, every trial-balance upload throws a data quality error in Clara. It is not the client being slow. The export format changed, the headers, the currency fields, the dates, and Clara still expects the old SAP layout. So I re-export and reformat each one in Excel by hand, forty-five minutes to an hour and a half each. I just never flagged it as a systemic thing.",
  it: "Funny you ask before building something new. Two years ago we built an evidence-retrieval API as part of a Clara connector project. It already normalizes trial-balance data from twelve ERP systems, including that cloud one, into a standard schema. It is in production and security-reviewed. It just never got a formal rollout, so almost nobody knows it is there.",
  risk: "Timing matters more than people realize. CPAB is running a thematic review of AI in audit across the Big Four in about six weeks. They will ask exactly which AI tools are in our engagements and whether they are in approved methodology. Anything we stand up undocumented before that becomes a comment form. Documented and sequenced correctly, it is actually a showcase.",
};

const DEMO_SYNTH = {
  realProblem:
    "The root cause is an upstream ERP data-format change ~8 months ago that Clara's reconciliation engine cannot parse. It surfaces as a generic 'data quality' error, so the senior manually reformats every upload in Excel (45-90 min each). Not slow clients, not short staffing.",
  optimizingFor: "Cutting reopened-PBC cycle time and eliminating manual reformatting, defensibly to the regulator.",
  notSolving:
    "Not general client responsiveness, not headcount, not re-platforming Clara, and not the EQR reviewer-capacity issue. Real, but out of scope here.",
  assumptions:
    "IT's existing evidence-retrieval API already normalizes the new ERP format (confirmed with Sarah), and methodology documentation can be done before the CPAB review in six weeks.",
  successMetrics:
    "Median reopened-cycle time, manual-reformat minutes per engagement per week, percent of uploads auto-normalized, and zero net-new undocumented procedures at the CPAB review.",
};

const DEMO_SPEC = {
  workflowSteps:
    "1 [AGENT] Document Retriever ingests the upload. 2 [AGENT] ERP Format Normalizer maps it to the standard schema. 3 [AGENT] Evidence Classifier flags real mismatches. 4 [HUMAN] Senior reviews only flagged exceptions. 5 [AGENT] Audit Trail Logger records every action. 6 [HUMAN] Partner/EQR sign-off unchanged.",
  autonomyBoundaries:
    "Agents normalize, classify, and log. They never form or sign off an audit conclusion. Every conclusion passes through the Human Approval Gate; sign-off authority stays with the senior, partner, and EQR.",
  dataTouched:
    "Client trial-balance exports, the Clara evidence repository, PBC request metadata. All within sanctioned infrastructure; the existing API is already security-reviewed.",
  failureModes:
    "A new ERP format the API does not know (route to manual + flag for an update); the classifier over-suppressing real exceptions (sample-audit auto-passed items); silent normalization errors (reconcile against source totals).",
  evalPlan:
    "Test cases from Marcus's real failures: (1) SAP-successor export with ISO-8601 dates and renamed headers normalizes correctly; (2) a genuinely incomplete upload is still flagged; (3) a risk-sensitive disclosure item is never auto-passed. Metrics: reopened-cycle time, percent auto-normalized, exception precision/recall. Weekly sample audit.",
  reusableComponent:
    "A format-mismatch detector that fingerprints an ERP export's shape and routes it to the correct normalizer, contributed to the shared stack.",
  whatILeftOut:
    "The EQR-capacity fix (resourcing, above scope) and any net-new vendor integration (the partner already killed one; reusing the sanctioned API is faster and lower-risk). No full autonomy in sign-off paths, non-negotiable in a regulated audit.",
};

const DEMO_COMPONENTS = ["erp-normalizer", "document-retriever", "evidence-classifier", "human-approval-gate", "audit-trail-logger"];
const DEMO_CONTRIBUTED = "format-mismatch-detector: fingerprints an ERP export's shape and routes it to the correct normalizer.";
const DEMO_BUILD_INSTRUCTION =
  "Build a workflow that routes incoming client trial-balance uploads through the existing ERP-normalizer API, classifies real exceptions, and routes every evidence conclusion through a human approval gate with a full audit trail. Humans sign off all conclusions; the agent never signs off in the regulated path.";
const DEMO_PITCH =
  "The real bottleneck is not slow clients or short staffing. It is an ERP format change Clara cannot parse, costing about an hour of manual reformatting per upload. IT already has a production, security-reviewed normalizer that handles this exact format, so we expose it, classify exceptions, keep a human on every sign-off, and document the procedure in methodology before the CPAB review in six weeks. Low-risk, fast, and defensible.";
const DEMO_REVISION =
  "After David flagged the methodology path, I moved the documentation gate ahead of go-live and added an explicit CPAB-review checkpoint. After Sarah confirmed the existing API, I dropped the proposed new connector and reused hers.";

const DEMO_BUILD_REPLY = `**Assumptions:** reuse the existing, security-reviewed ERP-normalizer API; humans retain all sign-off.

1. [AGENT] Document Retriever ingests the client trial-balance upload.
2. [AGENT] ERP Format Normalizer maps it to the standard schema. (component: erp-normalizer) - this is the actual fix.
3. [AGENT] Evidence Classifier flags genuine format/type mismatches; clean items pass. (component: evidence-classifier)
4. [HUMAN] Senior reviews only the flagged exceptions. (component: human-approval-gate)
5. [AGENT] Audit Trail Logger records every action, input, output, and approver. (component: audit-trail-logger)
6. [HUMAN] Partner / EQR sign-off, unchanged.

Failure handling: an unknown ERP format routes to manual and flags the API for an update; auto-passed items are sample-audited weekly.`;

const DEMO_PROTOTYPE_HTML = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Evidence Intake and Normalization</title>
<style>
:root{--cream:#faf6ef;--ink:#34302a;--soft:#6b6157;--faint:#9a9085;--line:#e7ddcf;--card:#fffdf9;--sky:#9ec6dd;--peach:#e7b48f;--lav:#b3a6d6}
*{box-sizing:border-box}body{margin:0;background:var(--cream);color:var(--ink);font:16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif}
.wrap{max-width:840px;margin:0 auto;padding:36px 26px}
h1{font-family:Georgia,serif;font-weight:500;font-size:28px;margin:0 0 4px}
.sub{color:var(--soft);margin:0 0 26px;font-size:15px}
.flow{display:flex;flex-direction:column;gap:0}
.node{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:13px 17px;box-shadow:0 10px 28px -20px rgba(52,48,42,.4)}
.who{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:2px 9px;border-radius:999px;display:inline-block}
.agent .who{background:var(--sky)}.human .who{background:var(--peach)}
.node h3{margin:7px 0 2px;font-size:15px}
.node p{margin:0;color:var(--soft);font-size:13px}
.chip{display:inline-block;margin-top:7px;font-size:11px;background:var(--cream);border:1px solid var(--line);border-radius:999px;padding:2px 9px;font-family:ui-monospace,monospace}
.arrow{align-self:center;color:var(--faint);font-size:18px;padding:5px 0}
.panels{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:28px}
.panel{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:13px 15px}
.panel .k{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--faint);margin:0 0 4px}
.panel p{margin:0;font-size:13px}
.tag{display:inline-block;margin-top:22px;font-family:Georgia,serif;font-style:italic;color:var(--lav)}
@media(max-width:620px){.panels{grid-template-columns:1fr}}
</style></head><body><div class="wrap">
<h1>Evidence Intake and Normalization</h1>
<p class="sub">An agentic workflow that fixes the real bottleneck, an unparsed ERP export format, by reusing the firm's existing security-reviewed API. Humans sign off everything.</p>
<div class="flow">
<div class="node agent"><span class="who">Agent</span><h3>1. Ingest upload</h3><p>Pull the client trial balance into a normalized store.</p><span class="chip">document-retriever</span></div>
<div class="arrow">&#8595;</div>
<div class="node agent"><span class="who">Agent</span><h3>2. Normalize format</h3><p>Map the new cloud-ERP export to the standard schema. This is the fix.</p><span class="chip">erp-normalizer</span></div>
<div class="arrow">&#8595;</div>
<div class="node agent"><span class="who">Agent</span><h3>3. Classify exceptions</h3><p>Flag genuine mismatches; clean items pass through.</p><span class="chip">evidence-classifier</span></div>
<div class="arrow">&#8595;</div>
<div class="node human"><span class="who">Human</span><h3>4. Senior reviews exceptions</h3><p>The senior reviews only what was flagged, not every upload.</p><span class="chip">human-approval-gate</span></div>
<div class="arrow">&#8595;</div>
<div class="node agent"><span class="who">Agent</span><h3>5. Log everything</h3><p>Append-only record of every action, input, output, and approver.</p><span class="chip">audit-trail-logger</span></div>
<div class="arrow">&#8595;</div>
<div class="node human"><span class="who">Human</span><h3>6. Partner / EQR sign-off</h3><p>Unchanged. The agent never signs off in the regulated path.</p></div>
</div>
<div class="panels">
<div class="panel"><p class="k">Problem</p><p>An ERP format change Clara cannot parse, not slow clients. About an hour of manual reformatting per upload.</p></div>
<div class="panel"><p class="k">Autonomy and sign-off</p><p>Agents normalize, classify, and log. Every conclusion passes a human approval gate.</p></div>
<div class="panel"><p class="k">Evaluation</p><p>Test cases from real failures; track reopened-cycle time and percent auto-normalized; weekly audit of auto-passed items.</p></div>
<div class="panel"><p class="k">Sequencing</p><p>Documented in methodology before the CPAB review in six weeks, so the review is a showcase, not a finding.</p></div>
</div>
<p class="tag">Contributes back: a format-mismatch detector for the shared stack.</p>
</div></body></html>`;

const DEMO_BOARDROOM: { who: string; text: string }[] = [
  { who: "You", text: DEMO_PITCH },
  {
    who: "Rachel Chen",
    text: "I like that it is fast and low-risk. But are you sure this won't turn into another five-month integration like last time? It cannot disrupt busy season.",
  },
  {
    who: "David Osei",
    text: "Reusing a security-reviewed API helps a great deal. But it is not in approved methodology yet. Document it before the CPAB review, or it becomes a comment form rather than a showcase.",
  },
  {
    who: "Sarah Okafor",
    text: "Happy to expose the API. Route through the sanctioned endpoint, keep client data in-region, and no personal AI accounts touching this.",
  },
  {
    who: "Marcus Webb",
    text: "Selfishly, this saves me an hour a file. As long as I still review the genuine exceptions myself, I am on board.",
  },
];

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

type PersonaId = (typeof ROSTER)[number]["id"];
type Tab = "discovery" | "synthesis" | "build" | "boardroom" | "submit";
type Msg = { role: "you" | "them"; text: string };

const TABS: { id: Tab; label: string }[] = [
  { id: "discovery", label: "Discovery" },
  { id: "synthesis", label: "Synthesis" },
  { id: "build", label: "Build" },
  { id: "boardroom", label: "Boardroom" },
  { id: "submit", label: "Submit" },
];

function TabNav({ tab, onSelect }: { tab: Tab; onSelect: (t: Tab) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {TABS.map((t, i) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            tab === t.id
              ? "bg-[var(--ink)] text-[var(--cream)] shadow-[0_10px_24px_-12px_rgba(52,48,42,0.6)]"
              : "pg-card text-[var(--ink-soft)] hover:-translate-y-0.5"
          }`}
        >
          <span className="mr-1.5 text-[0.7rem] opacity-60">{i + 1}</span>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export default function Workspace({ sessionId, brief, demo = false }: { sessionId: string; brief: string; demo?: boolean }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("discovery");
  const [questionsLeft, setQuestionsLeft] = useState(demo ? 16 : 20);
  const [busy, setBusy] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false); // mobile drawer

  // discovery: sequential, time-boxed. The candidate meets stakeholders in order;
  // no free choice. Each conversation runs on a clock and auto-advances.
  const [stageIndex, setStageIndex] = useState(0);
  const [discoveryDone, setDiscoveryDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DISCOVERY_SECONDS);
  const active = ROSTER[Math.min(stageIndex, ROSTER.length - 1)];
  const activePersona = active.id;
  // each stakeholder opens the meeting by introducing themselves (seeded, no question cost)
  // In demo mode, each thread is pre-seeded with the opener, the candidate's
  // question already sent, and the canned answer that reveals the key fact, so the
  // full conversation is on screen. Live mode starts with just the opener.
  const [threads, setThreads] = useState<Record<PersonaId, Msg[]>>(() =>
    Object.fromEntries(
      ROSTER.map((p) => [
        p.id,
        demo
          ? [
              { role: "them", text: p.opening },
              { role: "you", text: DEMO_QUESTIONS[p.id] },
              { role: "them", text: DEMO_ANSWERS[p.id] },
            ]
          : [{ role: "them", text: p.opening }],
      ])
    ) as Record<PersonaId, Msg[]>
  );
  const [draft, setDraft] = useState("");

  function advanceStakeholder() {
    recognitionRef.current?.stop();
    if (stageIndex < ROSTER.length - 1) {
      setStageIndex((i) => i + 1);
      setTimeLeft(DISCOVERY_SECONDS);
      setDraft("");
    } else {
      setDiscoveryDone(true);
    }
  }

  // per-stakeholder countdown; only runs while on the Discovery tab and not finished
  useEffect(() => {
    if (tab !== "discovery" || discoveryDone) return;
    if (timeLeft <= 0) {
      advanceStakeholder();
      return;
    }
    const id = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, discoveryDone, timeLeft, stageIndex]);

  // voice: browser STT for input, OpenAI TTS (via /api/speak) for persona replies
  const [speakReplies, setSpeakReplies] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const recModeRef = useRef<"fill" | "ptt">("fill");
  const pttTextRef = useRef("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sttSupported = typeof window !== "undefined" && getSR() !== null;

  // "fill" = click mic, transcript drops into the composer (manual send).
  // "ptt"  = hold spacebar to talk; on release, transcript auto-sends.
  function startRecognition(mode: "fill" | "ptt") {
    const SR = getSR();
    if (!SR || listening) return;
    const rec = new SR();
    rec.lang = "en-US";
    rec.continuous = mode === "ptt";
    rec.interimResults = mode === "ptt";
    recModeRef.current = mode;
    pttTextRef.current = "";
    rec.onresult = (e) => {
      if (mode === "fill") {
        const t = Array.from({ length: e.results.length }, (_, i) => e.results[i][0].transcript).join(" ");
        setDraft((d) => (d ? d + " " : "") + t);
      } else {
        let finalT = "";
        for (let i = 0; i < e.results.length; i++) if (e.results[i].isFinal) finalT += e.results[i][0].transcript;
        if (finalT) pttTextRef.current = finalT;
      }
    };
    rec.onend = () => {
      setListening(false);
      if (recModeRef.current === "ptt") {
        const text = pttTextRef.current.trim();
        if (text) void askPersona(text);
      }
    };
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  }

  function toggleMic() {
    if (listening) recognitionRef.current?.stop();
    else startRecognition("fill");
  }

  // Hold spacebar (on the Discovery tab, when not typing in a field) to talk;
  // release to auto-send. Walkie-talkie style.
  useEffect(() => {
    if (tab !== "discovery" || !sttSupported) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const el = document.activeElement;
      if (el && (el.tagName === "TEXTAREA" || el.tagName === "INPUT")) return; // let space type
      if (listening || busy || questionsLeft <= 0) return;
      e.preventDefault();
      startRecognition("ptt");
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      if (recModeRef.current === "ptt" && listening) {
        e.preventDefault();
        recognitionRef.current?.stop();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, listening, busy, questionsLeft, sttSupported]);

  async function playReply(text: string, persona: PersonaId) {
    if (!speakReplies) return;
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, persona }),
      });
      if (!res.ok) return; // TTS disabled or upstream error - silent text fallback
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioRef.current?.pause();
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => URL.revokeObjectURL(url);
      void audio.play();
    } catch {
      // ignore - voice is best-effort
    }
  }

  // copilot (the always-on AI panel)
  const [panel, setPanel] = useState<Msg[]>([]);
  const [panelDraft, setPanelDraft] = useState("");
  const [panelBusy, setPanelBusy] = useState(false);

  // synthesis
  const [synth, setSynth] = useState(demo ? DEMO_SYNTH : { realProblem: "", optimizingFor: "", notSolving: "", assumptions: "", successMetrics: "" });
  const [synthSaved, setSynthSaved] = useState(demo);

  // build
  const [spec, setSpec] = useState(
    demo
      ? DEMO_SPEC
      : { workflowSteps: "", autonomyBoundaries: "", dataTouched: "", failureModes: "", evalPlan: "", reusableComponent: "", whatILeftOut: "" }
  );
  const [usedComponents, setUsedComponents] = useState<string[]>(demo ? DEMO_COMPONENTS : []);
  const [contributed, setContributed] = useState(demo ? DEMO_CONTRIBUTED : "");
  const [buildChat, setBuildChat] = useState<Msg[]>(
    demo ? [{ role: "you", text: DEMO_BUILD_INSTRUCTION }, { role: "them", text: DEMO_BUILD_REPLY }] : []
  );
  const [buildDraft, setBuildDraft] = useState("");
  const [specSaved, setSpecSaved] = useState(demo);
  const [prototypeHtml, setPrototypeHtml] = useState(demo ? DEMO_PROTOTYPE_HTML : "");
  const [building, setBuilding] = useState(false);
  const [protoFull, setProtoFull] = useState(false);

  // boardroom
  const [boardroom, setBoardroom] = useState<{ who: string; text: string }[]>(demo ? DEMO_BOARDROOM : []);
  const [pitchDraft, setPitchDraft] = useState("");
  const [revisionNote, setRevisionNote] = useState(demo ? DEMO_REVISION : "");
  const [revisionSaved, setRevisionSaved] = useState(false);

  // submit (profile fixed; the scorecard is reviewer-facing only)
  const profile = "senior-consultant" as const;

  async function askPersona(override?: string) {
    const message = (override ?? draft).trim();
    if (!message || busy || questionsLeft <= 0) return;
    if (!override) setDraft("");
    setThreads((t) => ({ ...t, [activePersona]: [...t[activePersona], { role: "you", text: message }] }));
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, target: activePersona, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setThreads((t) => ({ ...t, [activePersona]: [...t[activePersona], { role: "them", text: data.reply }] }));
        setQuestionsLeft(data.questionsLeft);
        void playReply(data.reply, activePersona);
      } else {
        setThreads((t) => ({ ...t, [activePersona]: [...t[activePersona], { role: "them", text: `[${data.error}]` }] }));
      }
    } finally {
      setBusy(false);
    }
  }

  async function askPanel() {
    if (!panelDraft.trim() || panelBusy) return;
    const message = panelDraft.trim();
    setPanelDraft("");
    setPanel((p) => [...p, { role: "you", text: message }]);
    setPanelBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, target: "panel", message }),
      });
      const data = await res.json();
      setPanel((p) => [...p, { role: "them", text: data.reply ?? `[${data.error}]` }]);
    } finally {
      setPanelBusy(false);
    }
  }

  async function runBuild() {
    if (!buildDraft.trim() || busy) return;
    const instruction = buildDraft.trim();
    setBuildDraft("");
    setBuildChat((c) => [...c, { role: "you", text: instruction }]);
    setBusy(true);
    try {
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, instruction }),
      });
      const data = await res.json();
      setBuildChat((c) => [...c, { role: "them", text: data.artifact ?? `[${data.error}]` }]);
    } finally {
      setBusy(false);
    }
  }

  async function saveSynthesis() {
    setBusy(true);
    try {
      await fetch("/api/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, synthesis: synth }),
      });
      setSynthSaved(true);
    } finally {
      setBusy(false);
    }
  }

  async function saveSpec() {
    setBusy(true);
    try {
      await fetch("/api/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, spec, componentsUsed: usedComponents, contributedComponent: contributed || undefined }),
      });
      setSpecSaved(true);
    } finally {
      setBusy(false);
    }
  }

  // fuse the build-agent session + every spec field into one executive HTML prototype
  async function generatePrototype() {
    if (building) return;
    setBuilding(true);
    try {
      await fetch("/api/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, spec, componentsUsed: usedComponents, contributedComponent: contributed || undefined }),
      });
      setSpecSaved(true);
      const res = await fetch("/api/prototype", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok && data.html) setPrototypeHtml(data.html);
      else alert(`Prototype failed: ${data.error ?? res.status}`);
    } finally {
      setBuilding(false);
    }
  }

  async function sendPitch() {
    if (!pitchDraft.trim() || busy) return;
    const candidateMessage = pitchDraft.trim();
    setPitchDraft("");
    setBoardroom((b) => [...b, { who: "You", text: candidateMessage }]);
    setBusy(true);
    try {
      const res = await fetch("/api/boardroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, candidateMessage }),
      });
      const data = await res.json();
      if (data.reactions) {
        for (const r of data.reactions) {
          const who = ROSTER.find((p) => p.id === r.persona)?.name ?? r.persona;
          setBoardroom((b) => [...b, { who, text: r.message }]);
        }
      } else {
        setBoardroom((b) => [...b, { who: "system", text: `[${data.error}]` }]);
      }
    } finally {
      setBusy(false);
    }
  }

  async function saveRevision() {
    if (!revisionNote.trim() || busy) return;
    setBusy(true);
    try {
      await fetch("/api/synthesis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, revisionNote: revisionNote.trim() }),
      });
      setRevisionSaved(true);
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, profile }),
      });
      if (res.ok) router.push(`/report/${sessionId}`);
      else {
        const d = await res.json();
        alert(`Submit failed: ${d.error ?? res.status}`);
      }
    } finally {
      setBusy(false);
    }
  }

  const copilot = (
    <Copilot messages={panel} draft={panelDraft} onChange={setPanelDraft} onSend={askPanel} busy={panelBusy} />
  );

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-20 border-b border-[var(--line)] bg-[var(--cream)]/70 px-4 py-3 backdrop-blur-md sm:px-6 sm:py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <Image src="/kpmg-logo.png" alt="KPMG" width={66} height={26} priority className="h-[22px] w-auto shrink-0" />
            <span className="hidden h-5 w-px bg-[var(--line)] sm:block" />
            <span className="truncate font-display text-base tracking-tight text-[var(--ink)] sm:text-lg">
              Day One <span className="hidden text-[var(--ink-faint)] sm:inline">· Maple &amp; Birch LLP</span>
            </span>
          </div>
          <span
            className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition sm:px-4 sm:text-sm"
            style={{
              background: questionsLeft <= 3 ? "rgba(231,180,143,0.28)" : "rgba(255,255,255,0.7)",
              color: questionsLeft <= 3 ? "var(--peach-deep)" : "var(--ink-soft)",
              border: "1px solid var(--line)",
            }}
          >
            {questionsLeft} left
          </span>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 sm:px-6">
        {/* main column */}
        <div className="min-w-0 flex-1">
          <nav className="pt-5">
            <TabNav tab={tab} onSelect={setTab} />
          </nav>

          <div className="py-7">
            {tab === "discovery" && (
              <section key="discovery" className="pg-pop-stagger">
                <details open className="pg-card mb-5 rounded-2xl p-5 text-sm text-[var(--ink-soft)]">
                  <summary className="cursor-pointer font-medium text-[var(--ink)]">Engagement brief</summary>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed">{brief}</p>
                </details>

                {/* sequential progress: meet stakeholders in order, no free choice */}
                <div className="mb-5 flex items-center gap-2">
                  {ROSTER.map((p, i) => {
                    const state = discoveryDone || i < stageIndex ? "done" : i === stageIndex ? "current" : "upcoming";
                    return (
                      <div key={p.id} className="flex flex-1 items-center gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-semibold"
                            style={{
                              background: state === "upcoming" ? "var(--cream-deep)" : p.tint,
                              color: "var(--ink)",
                              opacity: state === "upcoming" ? 0.5 : 1,
                              outline: state === "current" ? "2px solid var(--ink)" : "none",
                              outlineOffset: "2px",
                            }}
                          >
                            {state === "done" ? "✓" : initials(p.name)}
                          </span>
                          <span className="hidden text-xs font-medium sm:inline" style={{ color: state === "current" ? "var(--ink)" : "var(--ink-faint)" }}>
                            {p.name.split(" ")[0]}
                          </span>
                        </div>
                        {i < ROSTER.length - 1 && <span className="h-px flex-1 bg-[var(--line)]" />}
                      </div>
                    );
                  })}
                </div>

                {discoveryDone ? (
                  <div className="pg-card rounded-2xl p-6 text-center">
                    <div className="font-display text-2xl font-light text-[var(--ink)]">Discovery complete</div>
                    <p className="mx-auto mt-2 max-w-md text-sm text-[var(--ink-soft)]">
                      You&apos;ve met all four stakeholders. Take what you heard into the problem brief.
                    </p>
                    <button
                      onClick={() => setTab("synthesis")}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-medium text-[var(--cream)] transition hover:-translate-y-0.5"
                    >
                      Go to Synthesis →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* stakeholder intro + timer */}
                    <div className="mb-3 flex items-center justify-between gap-3 rounded-2xl px-4 py-3" style={{ background: active.tint, border: `1px solid ${active.deep}` }}>
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ink)] text-xs font-semibold text-[var(--cream)]">
                          {initials(active.name)}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-[var(--ink)]">{active.name}</div>
                          <div className="text-xs text-[var(--ink-soft)]">{active.title}</div>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="font-mono text-xl font-semibold tabular-nums" style={{ color: timeLeft <= 60 ? "var(--peach-deep)" : "var(--ink)" }}>
                          {fmt(Math.max(0, timeLeft))}
                        </div>
                        <div className="text-[0.62rem] uppercase tracking-wide text-[var(--ink-soft)]">
                          {stageIndex + 1} of {ROSTER.length}
                        </div>
                      </div>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[var(--ink-soft)]">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input type="checkbox" checked={speakReplies} onChange={(e) => setSpeakReplies(e.target.checked)} className="accent-[var(--lavender-deep)]" />
                        🔊 Speak replies
                      </label>
                      {sttSupported ? (
                        <span className="text-[var(--ink-faint)]">Hold <kbd className="rounded bg-[var(--cream-deep)] px-1.5 py-0.5 font-sans">space</kbd> to talk, release to send.</span>
                      ) : (
                        <span className="text-[var(--peach-deep)]">Voice input needs Chrome or Edge.</span>
                      )}
                    </div>

                    <ChatThread messages={threads[activePersona]} accent={active.tint} typing={busy} empty={`Open the conversation with ${active.name} - type, hold space, or tap the mic.`} />
                    <Composer
                      value={draft}
                      onChange={setDraft}
                      onSend={askPersona}
                      disabled={busy || questionsLeft <= 0}
                      placeholder={questionsLeft <= 0 ? "Question budget exhausted." : `Ask ${active.name}…`}
                      onMic={sttSupported ? toggleMic : undefined}
                      listening={listening}
                    />
                    <div className="mt-3 flex justify-end">
                      <button
                        onClick={advanceStakeholder}
                        disabled={busy}
                        className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 disabled:opacity-50"
                        style={{ background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
                      >
                        {stageIndex < ROSTER.length - 1 ? "Wrap up & meet the next stakeholder →" : "Finish discovery →"}
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {tab === "synthesis" && (
              <section key="synthesis" className="pg-pop-stagger space-y-4">
                <Lead>Reconcile what you heard into one sharp problem brief.</Lead>
                {(
                  [
                    ["realProblem", "The real problem (vs. the presenting symptom)"],
                    ["optimizingFor", "What you're optimizing for"],
                    ["notSolving", "What you are explicitly NOT solving, and why"],
                    ["assumptions", "Key assumptions"],
                    ["successMetrics", "Success metrics"],
                  ] as const
                ).map(([k, label]) => (
                  <Field key={k} label={label} value={synth[k]} onChange={(v) => setSynth((s) => ({ ...s, [k]: v }))} />
                ))}
                <SaveButton onClick={saveSynthesis} saved={synthSaved} busy={busy} label="Save problem brief" />
              </section>
            )}

            {tab === "build" && (
              <section key="build" className="pg-pop-stagger space-y-5">
                <Lead>Direct the build agent to prototype your solution, reuse components, then write the spec.</Lead>

                <div className="pg-card rounded-2xl p-5">
                  <h3 className="mb-3 font-medium text-[var(--ink)]">Component library - reuse, don&apos;t rebuild</h3>
                  <div className="space-y-2.5">
                    {COMPONENT_LIBRARY.map((c) => (
                      <label key={c.id} className="flex cursor-pointer items-start gap-2.5 text-sm text-[var(--ink-soft)]">
                        <input
                          type="checkbox"
                          className="mt-1 accent-[var(--sage-deep)]"
                          checked={usedComponents.includes(c.id)}
                          onChange={(e) => setUsedComponents((u) => (e.target.checked ? [...u, c.id] : u.filter((x) => x !== c.id)))}
                        />
                        <span>
                          <span className="font-medium text-[var(--ink)]">{c.name}</span> - {c.desc}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pg-card rounded-2xl p-5">
                  <h3 className="mb-3 font-medium text-[var(--ink)]">Build agent</h3>
                  <ChatThread messages={buildChat} accent="var(--sky)" typing={busy} empty="Direct the build agent - e.g. “Build a workflow that…”." />
                  <Composer value={buildDraft} onChange={setBuildDraft} onSend={runBuild} disabled={busy} placeholder="Instruct the build agent…" />
                </div>

                {(
                  [
                    ["workflowSteps", "Workflow steps (multi-step)"],
                    ["autonomyBoundaries", "Autonomy boundaries - where agents act vs. where humans sign off"],
                    ["dataTouched", "Data touched"],
                    ["failureModes", "Failure modes"],
                    ["evalPlan", "Evaluation plan - success metrics + concrete test cases"],
                    ["reusableComponent", "What you'd contribute back as a reusable component"],
                    ["whatILeftOut", "What you deliberately left out, and why"],
                  ] as const
                ).map(([k, label]) => (
                  <Field key={k} label={label} value={spec[k]} onChange={(v) => setSpec((s) => ({ ...s, [k]: v }))} />
                ))}
                <Field label="Contribute a component back to the shared stack (optional)" value={contributed} onChange={setContributed} />
                <div className="flex flex-wrap items-center gap-3">
                  <SaveButton onClick={saveSpec} saved={specSaved} busy={busy} label="Save solution spec" />
                  <button
                    onClick={generatePrototype}
                    disabled={building}
                    className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-medium text-[var(--cream)] transition hover:-translate-y-0.5 disabled:opacity-50"
                  >
                    {building ? "Building prototype…" : "Generate prototype document →"}
                  </button>
                </div>
                <p className="text-xs text-[var(--ink-faint)]">
                  Fuses your build-agent session and every spec field above into one executive prototype: a flowchart of
                  your system plus a concise spec.
                </p>

                {prototypeHtml && (
                  <div className="pg-card rounded-2xl p-3">
                    <div className="mb-2 flex items-center justify-between px-1">
                      <span className="text-sm font-medium text-[var(--ink)]">Prototype document</span>
                      <button onClick={() => setProtoFull(true)} className="text-xs text-[var(--lavender-deep)] hover:underline">
                        Open full screen ↗
                      </button>
                    </div>
                    <iframe
                      srcDoc={prototypeHtml}
                      sandbox=""
                      title="Prototype document"
                      className="h-[70vh] w-full rounded-xl border border-[var(--line)] bg-white"
                    />
                  </div>
                )}
              </section>
            )}

            {tab === "boardroom" && (
              <section key="boardroom" className="pg-pop-stagger">
                <Lead>Pitch to the room. All four stakeholders are here, and they&apos;ll ping back with challenges. Then revise.</Lead>
                <Boardroom messages={boardroom} draft={pitchDraft} onChange={setPitchDraft} onSend={sendPitch} busy={busy} />
                <div className="pg-card mt-6 rounded-2xl p-5">
                  <label className="font-medium text-[var(--ink)]">Revision note - what you changed in response to the room</label>
                  <textarea
                    value={revisionNote}
                    onChange={(e) => setRevisionNote(e.target.value)}
                    rows={2}
                    className="mt-2 w-full rounded-xl border border-[var(--line)] bg-white/60 p-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--lavender-deep)]"
                  />
                  <SaveButton onClick={saveRevision} saved={revisionSaved} busy={busy} label="Save revision" />
                </div>
              </section>
            )}

            {tab === "submit" && (
              <section key="submit" className="pg-pop-stagger space-y-5">
                <Lead>
                  Submit your engagement for evaluation. Everything you did - your questions, notes, prototype, and
                  defense - is read by the judge and turned into a scored report.
                </Lead>
                <div className="pg-card max-w-xl rounded-2xl p-5 text-sm text-[var(--ink-soft)]">
                  The scorecard that follows is a confidential reviewer document. You won&apos;t see it as a candidate;
                  it&apos;s prepared for the hiring panel.
                </div>
                <button
                  onClick={submit}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3.5 font-medium text-[var(--cream)] shadow-[0_14px_34px_-14px_rgba(52,48,42,0.55)] transition hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {busy ? "Scoring your session…" : "Submit engagement →"}
                </button>
              </section>
            )}

            <div className="mt-2 border-t border-[var(--line)] pt-6">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-faint)]">Go to</p>
              <TabNav
                tab={tab}
                onSelect={(t) => {
                  setTab(t);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </div>
        </div>

        {/* persistent copilot - desktop */}
        <aside className="sticky top-[76px] hidden h-[calc(100vh-92px)] w-[340px] shrink-0 py-7 lg:block">
          {copilot}
        </aside>
      </div>

      {/* copilot - mobile toggle + drawer */}
      <button
        onClick={() => setCopilotOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--ink)] text-xl text-[var(--cream)] shadow-[0_14px_34px_-12px_rgba(52,48,42,0.6)] lg:hidden"
        aria-label="Open AI copilot"
      >
        ✦
      </button>
      {copilotOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-[var(--ink)]/30 backdrop-blur-sm" onClick={() => setCopilotOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-[90%] max-w-sm flex-col bg-[var(--cream)] p-4 shadow-2xl">
            <button onClick={() => setCopilotOpen(false)} className="mb-2 self-end text-sm text-[var(--ink-soft)]">
              Close ✕
            </button>
            <div className="min-h-0 flex-1">{copilot}</div>
          </div>
        </div>
      )}

      {/* prototype full-screen: sandboxed (no scripts, null origin) - candidate HTML can't touch this origin */}
      {protoFull && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[var(--ink)]/40 p-3 backdrop-blur-sm sm:p-6">
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium text-[var(--cream)]">Prototype document</span>
            <button onClick={() => setProtoFull(false)} className="rounded-full bg-[var(--cream)] px-4 py-1.5 text-sm font-medium text-[var(--ink)]">
              Close ✕
            </button>
          </div>
          <iframe srcDoc={prototypeHtml} sandbox="" title="Prototype document" className="min-h-0 w-full flex-1 rounded-2xl border border-[var(--line)] bg-white" />
        </div>
      )}

      <ReviewerGuide page={tab} />
    </main>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 max-w-2xl text-[var(--ink-soft)]">{children}</p>;
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--ink-faint)]" style={{ animationDelay: `${i * 0.15}s` }} />
      ))}
    </span>
  );
}

function ChatThread({ messages, empty, accent, typing }: { messages: Msg[]; empty: string; accent: string; typing?: boolean }) {
  return (
    <div className="pg-card mb-3 max-h-[52vh] space-y-3 overflow-y-auto rounded-2xl p-5">
      {messages.length === 0 && !typing && <p className="text-sm text-[var(--ink-faint)]">{empty}</p>}
      {messages.map((m, i) => (
        <div key={i} className={`pg-pop flex ${m.role === "you" ? "justify-end" : "justify-start"}`}>
          <span
            className="inline-block max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
            style={
              m.role === "you"
                ? { background: "var(--ink)", color: "var(--cream)" }
                : { background: "white", color: "var(--ink)", borderLeft: `3px solid ${accent}`, boxShadow: "0 6px 18px -12px rgba(52,48,42,0.35)" }
            }
          >
            {m.text}
          </span>
        </div>
      ))}
      {typing && (
        <div className="flex justify-start">
          <span className="rounded-2xl bg-white px-4 py-3" style={{ borderLeft: `3px solid ${accent}` }}>
            <TypingDots />
          </span>
        </div>
      )}
    </div>
  );
}

// Phone-style group chat for the boardroom: you post on the right, stakeholders
// ping back on the left with avatar + name, and the room "types" while replies load.
function Boardroom({
  messages,
  draft,
  onChange,
  onSend,
  busy,
}: {
  messages: { who: string; text: string }[];
  draft: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--cream-deep)]/50 shadow-[0_18px_48px_-24px_rgba(52,48,42,0.3)]">
      {/* room header with participant avatars */}
      <div className="flex items-center gap-3 border-b border-[var(--line)] bg-[var(--card)] px-4 py-3 backdrop-blur">
        <div className="flex -space-x-2">
          {ROSTER.map((p) => (
            <span
              key={p.id}
              title={p.name}
              className="flex h-7 w-7 items-center justify-center rounded-full text-[0.6rem] font-semibold text-[var(--ink)] ring-2 ring-[var(--cream)]"
              style={{ background: p.tint }}
            >
              {initials(p.name)}
            </span>
          ))}
        </div>
        <div>
          <div className="text-sm font-medium text-[var(--ink)]">Engagement room</div>
          <div className="text-xs text-[var(--ink-faint)]">Rachel, Marcus, Sarah, David</div>
        </div>
      </div>

      {/* messages */}
      <div className="flex max-h-[52vh] min-h-[240px] flex-col gap-3 overflow-y-auto p-4">
        {messages.length === 0 && !busy && (
          <p className="m-auto max-w-xs text-center text-sm text-[var(--ink-faint)]">
            Post your proposal to open the room. The stakeholders will reply here.
          </p>
        )}
        {messages.map((m, i) => {
          const who = ROSTER.find((p) => p.name === m.who);
          const isYou = m.who === "You";
          if (m.who === "system")
            return (
              <p key={i} className="mx-auto text-xs text-[var(--peach-deep)]">
                {m.text}
              </p>
            );
          if (isYou)
            return (
              <div key={i} className="pg-pop flex justify-end">
                <span className="max-w-[78%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--ink)] px-4 py-2.5 text-sm leading-relaxed text-[var(--cream)]">
                  {m.text}
                </span>
              </div>
            );
          return (
            <div key={i} className="pg-pop flex items-end gap-2">
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.62rem] font-semibold text-[var(--ink)]"
                style={{ background: who?.tint ?? "var(--line)" }}
              >
                {initials(m.who)}
              </span>
              <div className="max-w-[78%]">
                <div className="mb-0.5 ml-1 text-xs font-medium" style={{ color: who?.deep ?? "var(--ink-faint)" }}>
                  {m.who}
                </div>
                <span className="inline-block whitespace-pre-wrap rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-sm leading-relaxed text-[var(--ink)] shadow-[0_6px_18px_-12px_rgba(52,48,42,0.35)]">
                  {m.text}
                </span>
              </div>
            </div>
          );
        })}
        {busy && (
          <div className="flex items-end gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--line)] text-[0.62rem]">…</span>
            <span className="rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-[0_6px_18px_-12px_rgba(52,48,42,0.35)]">
              <TypingDots />
            </span>
          </div>
        )}
      </div>

      {/* composer */}
      <div className="border-t border-[var(--line)] bg-[var(--card)] p-3">
        <div className="flex items-stretch gap-2">
          <textarea
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={1}
            disabled={busy}
            placeholder="Message the room…"
            className="flex-1 resize-none rounded-2xl border border-[var(--line)] bg-white/80 p-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--lavender-deep)] disabled:opacity-50"
          />
          <button
            onClick={() => onSend()}
            disabled={busy}
            className="rounded-2xl bg-[var(--ink)] px-5 text-sm font-medium text-[var(--cream)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function Copilot({
  messages,
  draft,
  onChange,
  onSend,
  busy,
}: {
  messages: Msg[];
  draft: string;
  onChange: (v: string) => void;
  onSend: () => void;
  busy: boolean;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--line)] bg-[var(--card)] shadow-[0_18px_48px_-24px_rgba(52,48,42,0.25)] backdrop-blur">
      <div className="border-b border-[var(--line)] px-4 py-3">
        <div className="flex items-center gap-2 font-medium text-[var(--ink)]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lavender)] text-xs text-[var(--ink)]">✦</span>
          AI Copilot
        </div>
        <p className="mt-1 text-xs leading-snug text-[var(--ink-faint)]">
          Always here. Free - it doesn&apos;t cost questions. How you use it (augment vs. outsource) is part of what the judge sees.
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto p-4">
        {messages.length === 0 && !busy && (
          <p className="text-sm text-[var(--ink-faint)]">Ask anything - critique your framing, draft text, list questions to ask, brainstorm.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`pg-pop flex ${m.role === "you" ? "justify-end" : "justify-start"}`}>
            <span
              className="inline-block max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed"
              style={
                m.role === "you"
                  ? { background: "var(--ink)", color: "var(--cream)" }
                  : { background: "white", color: "var(--ink)", boxShadow: "0 6px 18px -12px rgba(52,48,42,0.35)" }
              }
            >
              {m.text}
            </span>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <span className="rounded-2xl bg-white px-3.5 py-2.5">
              <TypingDots />
            </span>
          </div>
        )}
      </div>

      <div className="border-t border-[var(--line)] p-3">
        <div className="flex items-stretch gap-2">
          <textarea
            value={draft}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            rows={2}
            disabled={busy}
            placeholder="Ask the copilot…"
            className="flex-1 resize-none rounded-2xl border border-[var(--line)] bg-white/80 p-3 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--lavender-deep)] disabled:opacity-50"
          />
          <button
            onClick={() => onSend()}
            disabled={busy}
            className="rounded-2xl bg-[var(--ink)] px-4 text-sm font-medium text-[var(--cream)] transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

function Composer({
  value,
  onChange,
  onSend,
  disabled,
  placeholder,
  onMic,
  listening,
}: {
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  disabled: boolean;
  placeholder: string;
  onMic?: () => void;
  listening?: boolean;
}) {
  return (
    <div className="flex items-stretch gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSend();
        }}
        rows={2}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 rounded-2xl border border-[var(--line)] bg-white/70 p-3.5 text-sm text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)] focus:border-[var(--lavender-deep)] disabled:opacity-50"
      />
      {onMic && (
        <button
          onClick={onMic}
          disabled={disabled}
          title={listening ? "Stop" : "Speak"}
          className={`rounded-2xl px-4 text-sm font-medium transition disabled:opacity-50 ${listening ? "animate-pulse" : "hover:-translate-y-0.5"}`}
          style={listening ? { background: "var(--peach)", color: "var(--ink)" } : { background: "var(--card)", color: "var(--ink)", border: "1px solid var(--line)" }}
        >
          {listening ? "● rec" : "🎤"}
        </button>
      )}
      <button
        onClick={() => onSend()}
        disabled={disabled}
        className="rounded-2xl bg-[var(--ink)] px-6 text-sm font-medium text-[var(--cream)] transition hover:-translate-y-0.5 disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium text-[var(--ink)]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="mt-1.5 w-full rounded-2xl border border-[var(--line)] bg-white/60 p-3 text-sm text-[var(--ink)] outline-none transition focus:border-[var(--lavender-deep)]"
      />
    </div>
  );
}

function SaveButton({ onClick, saved, busy, label }: { onClick: () => void; saved: boolean; busy: boolean; label: string }) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className="rounded-full px-5 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 disabled:opacity-50"
      style={{ background: saved ? "var(--sage)" : "var(--card)", color: "var(--ink)", border: `1px solid ${saved ? "var(--sage-deep)" : "var(--line)"}` }}
    >
      {saved ? "✓ Saved - save again to update" : label}
    </button>
  );
}
