"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReviewerGuide from "@/components/ReviewerGuide";

export default function Landing() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function start(demo = false) {
    setLoading(true);
    const res = await fetch("/api/session", { method: "POST" });
    const data = await res.json();
    router.push(`/sim/${data.sessionId}${demo ? "?demo=1" : ""}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16 sm:py-20">
      <div className="pg-pop-stagger">
        <div className="mb-8 flex items-center gap-3">
          <Image src="/kpmg-logo.png" alt="KPMG" width={92} height={36} priority className="h-9 w-auto" />
          <span className="h-6 w-px bg-[var(--line)]" />
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-[var(--ink-faint)]">AI&nbsp;Lab</span>
        </div>

        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.35em] text-[var(--ink-faint)]">Day One</p>

        <h1 className="font-display mt-5 text-[2.6rem] font-light leading-[1.08] tracking-tight text-[var(--ink)] sm:text-6xl">
          Trace how an AI&nbsp;Builder
          <br />
          <span className="italic text-[var(--lavender-deep)]">thinks</span>.
        </h1>

        <p className="mt-7 max-w-xl text-lg leading-relaxed text-[var(--ink-soft)]">
          Step into <span className="font-medium text-[var(--ink)]">Maple &amp; Birch LLP</span>, a firm with a
          problem no one can quite name. Four people will tell you four different stories. Ask the right questions,
          find what&apos;s really going on, build something real, and defend it.
        </p>

        <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-faint)]">
          Everything you do is recorded and scored against the AI&nbsp;Builder job description, with evidence cited
          and a human signing off. With AI, answers are cheap, so we measure the questions. You have twenty.
        </p>

        <div className="mt-10">
          <button
            onClick={() => start(false)}
            disabled={loading}
            className="group inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-7 py-3.5 text-[0.95rem] font-medium text-[var(--cream)] shadow-[0_14px_34px_-14px_rgba(52,48,42,0.55)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Opening the room…" : "Begin the engagement"}
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
          <button
            onClick={() => start(true)}
            disabled={loading}
            className="ml-3 text-sm text-[var(--ink-faint)] underline-offset-4 transition hover:text-[var(--ink)] hover:underline disabled:opacity-60"
          >
            Demo mode (pre-filled)
          </button>
        </div>

        <div className="mt-12 border-t border-[var(--line)] pt-6">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--ink-faint)]">Reviewers: see a scored sample</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a href="/report/sample-strong" className="pg-card flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--ink)] transition hover:-translate-y-0.5">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--sage)" }} />
              Strong <span className="font-semibold">4.00</span>
            </a>
            <a href="/report/sample-weak" className="pg-card flex items-center gap-2 rounded-full px-4 py-2 text-sm text-[var(--ink)] transition hover:-translate-y-0.5">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--peach)" }} />
              Weak <span className="font-semibold">1.00</span>
            </a>
          </div>
        </div>
      </div>
      <ReviewerGuide page="landing" />
    </main>
  );
}
