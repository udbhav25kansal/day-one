"use client";

import { useEffect, useState } from "react";

// A reviewer-only guide. On every page it offers one concise, on-brand popover
// that (a) tells the reviewer what they are looking at and (b) names the exact
// brief / job-description requirement that step satisfies. It auto-opens once
// per page per session (the guided walk-through), then stays one click away.
// Non-blocking by design: the page underneath stays fully interactive, and the
// whole thing is print:hidden so it never bleeds into the exported scorecard.

export type GuideKey =
  | "landing"
  | "discovery"
  | "synthesis"
  | "build"
  | "boardroom"
  | "submit"
  | "report";

const GUIDE: Record<GuideKey, { title: string; lead: string; points: string[] }> = {
  landing: {
    title: "For reviewers",
    lead: "A 60-second map, so the review is effortless.",
    points: [
      "This is a working environment that evaluates AI Builders, the case-study brief itself, built end to end.",
      "Thesis: with AI, answers are cheap, so we measure the questions. Each candidate gets a 20-question budget.",
      "Path: Discovery, Synthesis, Build, Boardroom, Submit, then a scored reviewer report.",
      "Press Demo mode to walk the whole thing pre-filled in about two minutes.",
    ],
  },
  discovery: {
    title: "Discovery",
    lead: "Enterprise fluency, under ambiguity.",
    points: [
      "Four stakeholders with competing priorities. Hidden facts surface only under the right question, the JD's enterprise fluency and comfort in ambiguity.",
      "Tests problem definition before any solutioning. End-to-end ownership starts here.",
      "Watch the question budget: question quality is the headline metric, not answers.",
    ],
  },
  synthesis: {
    title: "Synthesis",
    lead: "Frame the real problem.",
    points: [
      "The candidate states the true problem in their own words, the JD's problem definition and judgment.",
      "Graded against the hidden facts they actually uncovered, not on vibes.",
    ],
  },
  build: {
    title: "Build",
    lead: "Workflows, not models. Reuse, not scratch.",
    points: [
      "They design an agentic workflow with human-AI handoffs and autonomy boundaries, the JD's think in workflows.",
      "They are given a stack of reusable components and choose what fits the problem, so each build starts further ahead, the JD's reusable components.",
      "Produces a real, defensible prototype, the JD's builder mindset and prototype-to-production lifecycle.",
    ],
  },
  boardroom: {
    title: "Boardroom",
    lead: "Iterate under pressure.",
    points: [
      "All four stakeholders push back at once, the JD's build, test, learn, iterate.",
      "Tests whether they take feedback and revise, not just defend their first answer.",
    ],
  },
  submit: {
    title: "Submit",
    lead: "Evaluation by design.",
    points: [
      "Every action is traced and scored against the JD, with the evidence cited, the JD's evaluations.",
      "Governance is a scored design constraint, not an afterthought, the JD's risk, governance, and trust.",
    ],
  },
  report: {
    title: "Reviewer scorecard",
    lead: "Decision support. A human signs off.",
    points: [
      "Six JD-aligned dimensions; every score cites evidence from the candidate's own trace.",
      "A deterministic fact audit anchors the AI judge, guarding against bias.",
      "Name-blind, with a required human override. No auto-reject, mirroring KPMG's position that no hiring decision is made by AI.",
    ],
  },
};

const TINT: Record<GuideKey, string> = {
  landing: "var(--lavender)",
  discovery: "var(--lavender)",
  synthesis: "var(--sky)",
  build: "var(--sage)",
  boardroom: "var(--peach)",
  submit: "var(--lavender)",
  report: "var(--sage)",
};

export default function ReviewerGuide({ page }: { page: GuideKey }) {
  const [open, setOpen] = useState(false);

  // auto-open once per page per session: the guided walk-through, without nagging
  useEffect(() => {
    if (typeof window === "undefined") return;
    const k = `pg_guide_${page}`;
    if (!sessionStorage.getItem(k)) {
      setOpen(true);
      sessionStorage.setItem(k, "1");
    }
  }, [page]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const g = GUIDE[page];
  const tint = TINT[page];

  return (
    <div className="print:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 left-5 z-30 inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-medium text-[var(--cream)] shadow-[0_14px_34px_-14px_rgba(52,48,42,0.55)] transition hover:-translate-y-0.5"
        aria-label="Reviewer guide"
      >
        <span aria-hidden>✦</span>
        Reviewer guide
      </button>

      {open && (
        <div className="pg-pop fixed bottom-[4.75rem] left-5 z-40 w-[calc(100vw-2.5rem)] max-w-[22rem]">
          <div className="pg-card rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: tint }} />
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                    For reviewers
                  </span>
                </div>
                <h3 className="font-display mt-1.5 text-xl font-light text-[var(--ink)]">{g.title}</h3>
                <p className="mt-0.5 text-sm italic text-[var(--lavender-deep)]">{g.lead}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="-mr-1 -mt-1 shrink-0 rounded-full px-2 py-1 text-sm text-[var(--ink-faint)] transition hover:text-[var(--ink)]"
                aria-label="Close guide"
              >
                ✕
              </button>
            </div>

            <ul className="mt-3 space-y-2.5">
              {g.points.map((p, i) => (
                <li key={i} className="flex gap-2.5 text-[0.84rem] leading-relaxed text-[var(--ink-soft)]">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: tint }} />
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <p className="mt-4 border-t border-[var(--line)] pt-3 text-[0.7rem] leading-relaxed text-[var(--ink-faint)]">
              These notes are here only to make walking the app effortless. Candidates never see them.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
