"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Scorecard, TraceEvent } from "@/lib/types";
import ReviewerGuide from "@/components/ReviewerGuide";

function scoreStyle(n: number): { background: string; color: string } {
  if (n >= 3.5) return { background: "var(--sage)", color: "var(--ink)" };
  if (n >= 2.5) return { background: "var(--sky)", color: "var(--ink)" };
  if (n >= 1.5) return { background: "var(--peach)", color: "var(--ink)" };
  return { background: "#d99b9b", color: "var(--ink)" };
}

function verdict(total: number, gated: boolean): { label: string; color: string } {
  if (gated) return { label: "Below bar — governance flag", color: "#b9554a" };
  if (total >= 3.4) return { label: "Advance — strong signal", color: "var(--sage-deep)" };
  if (total >= 2.6) return { label: "Borderline — discuss", color: "var(--sky-deep)" };
  return { label: "Below bar", color: "#b9554a" };
}

export default function Report({
  sessionId,
  scorecard,
  trace,
  dimNames,
  prototypeHtml,
}: {
  sessionId: string;
  scorecard: Scorecard;
  trace: TraceEvent[];
  dimNames: Record<string, string>;
  prototypeHtml: string;
}) {
  const [protoOpen, setProtoOpen] = useState(false);
  const router = useRouter();
  const traceById = Object.fromEntries(trace.map((e) => [e.id, e]));
  const order = { low: 0, medium: 1, high: 2 } as const;
  const dims = [...scorecard.dimensions].sort((a, b) => order[a.confidence] - order[b.confidence]);
  const v = verdict(scorecard.weightedTotal, !!scorecard.gateTriggered);

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-5 py-8 pg-pop-stagger sm:px-6 sm:py-10">
        {/* reviewers-only banner */}
        <div className="print:hidden mb-5 flex items-center justify-between gap-3 rounded-xl border border-[var(--peach)] bg-[rgba(231,180,143,0.16)] px-4 py-2.5 text-xs">
          <span className="font-medium text-[var(--peach-deep)]">
            Confidential reviewer document. Candidates do not see this page.
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {prototypeHtml && (
              <button
                onClick={() => setProtoOpen(true)}
                className="rounded-full border border-[var(--line)] bg-[var(--card)] px-4 py-1.5 font-medium text-[var(--ink)] transition hover:-translate-y-0.5"
              >
                View prototype ↗
              </button>
            )}
            <button
              onClick={() => window.print()}
              className="rounded-full bg-[var(--ink)] px-4 py-1.5 font-medium text-[var(--cream)] transition hover:-translate-y-0.5"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* masthead */}
        <div className="flex items-center gap-3 border-b border-[var(--line)] pb-4">
          <Image src="/kpmg-logo.png" alt="KPMG" width={74} height={29} priority className="h-[24px] w-auto" />
          <span className="h-6 w-px bg-[var(--line)]" />
          <div>
            <h1 className="font-display text-2xl font-light leading-none tracking-tight text-[var(--ink)]">
              AI Builder — Candidate Evaluation
            </h1>
            <p className="mt-1 text-xs text-[var(--ink-faint)]">
              Day One · profile: {scorecard.profile} · AI judge proposes, human reviewer signs off
            </p>
          </div>
        </div>

        {/* verdict band */}
        <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-[var(--line)] bg-[var(--card)] px-5 py-4">
          <div>
            <div className="text-xs uppercase tracking-[0.16em] text-[var(--ink-faint)]">Recommendation</div>
            <div className="mt-1 text-lg font-semibold" style={{ color: v.color }}>
              {v.label}
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block rounded-2xl px-5 py-2.5 text-3xl font-semibold" style={scoreStyle(scorecard.weightedTotal)}>
              {scorecard.weightedTotal.toFixed(2)}
            </div>
            <div className="mt-1 text-xs text-[var(--ink-faint)]">weighted, out of 4.00</div>
          </div>
        </div>

        {scorecard.gateTriggered && (
          <div className="mt-3 rounded-2xl px-5 py-3 text-sm" style={{ background: "rgba(217,155,155,0.18)", border: "1px solid #d99b9b" }}>
            <span className="font-semibold text-[var(--ink)]">Governance gate triggered.</span>{" "}
            <span className="text-[var(--ink-soft)]">{scorecard.gateTriggered}</span>
          </div>
        )}

        {/* snapshot */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          <Stat label="Critical facts" value={`${scorecard.audit.criticalFactsFound.length} / 4`} sub={scorecard.audit.criticalFactsFound.join(", ") || "none surfaced"} />
          <Stat label="Questions" value={`${scorecard.audit.questionsUsed} / 20`} sub={Object.entries(scorecard.audit.questionsPerPersona).map(([k, v2]) => `${k} ${v2}`).join(", ")} />
          <Stat label="Components reused" value={`${scorecard.audit.componentsReused}`} sub="from shared library" />
          <Stat label="Iterated" value={scorecard.audit.revisedAfterBoardroom ? "Yes" : "No"} sub="revised after boardroom" />
        </div>

        {/* per-dimension one-liners with one example */}
        <div className="mt-6 space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">Scoring against the rubric</h2>
          {dims.map((d) => {
            const ex = d.evidence[0];
            const shown = d.humanOverride ? d.humanOverride.score : d.score;
            return (
              <div key={d.dimension} className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-base font-semibold" style={scoreStyle(shown)}>
                    {shown}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-medium text-[var(--ink)]">
                        {d.dimension}. {dimNames[d.dimension] ?? d.dimension}
                      </span>
                      <span className="text-xs text-[var(--ink-faint)]">{d.confidence} confidence</span>
                      {d.humanOverride && <span className="text-xs text-[var(--lavender-deep)]">reviewer-adjusted from {d.score}</span>}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-[var(--ink-soft)] print:line-clamp-none" title={d.rationale}>
                      {d.rationale}
                    </p>
                    {ex && (
                      <p className="mt-1.5 text-xs text-[var(--ink-faint)]">
                        e.g.{" "}
                        <a href={`#${ex.eventId}`} className="print:no-underline font-mono text-[var(--lavender-deep)] hover:underline">
                          {ex.eventId}
                        </a>{" "}
                        &ldquo;{ex.quote}&rdquo;
                        {!traceById[ex.eventId] && <span className="ml-1 text-[var(--peach-deep)]">(unverified ref)</span>}
                      </p>
                    )}
                    <OverrideControl sessionId={sessionId} dimension={d.dimension} current={d.score} onDone={() => router.refresh()} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-xs leading-relaxed text-[var(--ink-faint)]">
          Method: each dimension is scored from the candidate&apos;s recorded work-trace by an independent AI judge that
          must cite evidence; a deterministic audit (above) anchors the soft scores; a reviewer may override any line.
          Decision-support only — no hiring decision is made by AI.
        </p>

        {/* appendix: full trace (screen only) */}
        <details className="print:hidden mt-8">
          <summary className="cursor-pointer text-sm font-medium text-[var(--ink-soft)]">Appendix: full session trace ({trace.length} events)</summary>
          <div className="mt-3 space-y-1.5">
            {trace.map((e) => (
              <div key={e.id} id={e.id} className="rounded-xl border border-[var(--line)] bg-white/50 p-3 text-xs">
                <span className="font-mono text-[var(--lavender-deep)]">{e.id}</span>{" "}
                <span className="text-[var(--ink-faint)]">[{e.phase} · {e.actor} · {e.type}]</span>
                <div className="mt-1 whitespace-pre-wrap text-[var(--ink-soft)]">{e.content}</div>
              </div>
            ))}
          </div>
        </details>

        <a href="/" className="print:hidden mt-8 inline-block text-sm text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
          &larr; Back to Day One
        </a>
      </div>

      {/* prototype viewer: sandboxed (no scripts, null origin) so candidate-influenced HTML cannot touch this origin */}
      {protoOpen && (
        <div className="print:hidden fixed inset-0 z-50 flex flex-col bg-[var(--ink)]/40 backdrop-blur-sm p-3 sm:p-6">
          <div className="mb-2 flex shrink-0 items-center justify-between">
            <span className="text-sm font-medium text-[var(--cream)]">Candidate prototype</span>
            <button onClick={() => setProtoOpen(false)} className="rounded-full bg-[var(--cream)] px-4 py-1.5 text-sm font-medium text-[var(--ink)]">
              Close ✕
            </button>
          </div>
          <iframe srcDoc={prototypeHtml} sandbox="" title="Candidate prototype" className="min-h-0 w-full flex-1 rounded-2xl border border-[var(--line)] bg-white" />
        </div>
      )}

      <ReviewerGuide page="report" />
    </main>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--card)] p-3.5">
      <div className="text-xs text-[var(--ink-faint)]">{label}</div>
      <div className="mt-0.5 text-lg font-semibold text-[var(--ink)]">{value}</div>
      <div className="mt-0.5 truncate text-[0.7rem] text-[var(--ink-faint)]" title={sub}>
        {sub}
      </div>
    </div>
  );
}

function OverrideControl({
  sessionId,
  dimension,
  current,
  onDone,
}: {
  sessionId: string;
  dimension: string;
  current: number;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [score, setScore] = useState(current);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!reason.trim()) return;
    setBusy(true);
    try {
      await fetch("/api/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, dimension, score, reason: reason.trim() }),
      });
      setOpen(false);
      onDone();
    } finally {
      setBusy(false);
    }
  }

  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="print:hidden mt-2 text-xs text-[var(--ink-faint)] transition hover:text-[var(--lavender-deep)]">
        Reviewer override
      </button>
    );

  return (
    <div className="print:hidden mt-2.5 rounded-2xl border border-[var(--line)] bg-white/60 p-3.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-[var(--ink-soft)]">Override:</span>
        {[1, 2, 3, 4].map((n) => (
          <button
            key={n}
            onClick={() => setScore(n)}
            className="h-8 w-8 rounded-lg text-sm transition"
            style={score === n ? { background: "var(--ink)", color: "var(--cream)" } : { background: "var(--cream-deep)", color: "var(--ink-soft)" }}
          >
            {n}
          </button>
        ))}
      </div>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason (required, logged to the trace)"
        className="mt-2.5 w-full rounded-xl border border-[var(--line)] bg-white/70 p-2.5 text-sm text-[var(--ink)] outline-none focus:border-[var(--lavender-deep)]"
      />
      <div className="mt-2.5 flex gap-2">
        <button onClick={save} disabled={busy || !reason.trim()} className="rounded-full bg-[var(--ink)] px-4 py-1.5 text-xs font-medium text-[var(--cream)] disabled:opacity-50">
          Save override
        </button>
        <button onClick={() => setOpen(false)} className="rounded-full px-4 py-1.5 text-xs text-[var(--ink-soft)]" style={{ background: "var(--cream-deep)" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
