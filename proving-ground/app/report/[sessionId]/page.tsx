import { loadSession } from "@/lib/store";
import { ensureSamplesLoaded } from "@/lib/samples";
import { DIMENSIONS } from "@/lib/rubric";
import Report from "@/components/Report";

const DIM_NAMES = Object.fromEntries(DIMENSIONS.map((d) => [d.id, d.name]));

export default async function ReportPage({ params }: { params: Promise<{ sessionId: string }> }) {
  await ensureSamplesLoaded();
  const { sessionId } = await params;
  const s = await loadSession(sessionId);

  if (!s) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold">Session not found</h1>
          <p className="mt-3 text-slate-400">
            This session isn&apos;t in memory. Live sessions are held in-process; if the server restarted, the run is
            gone. The seeded <a className="text-sky-400 underline" href="/report/sample-strong">strong</a> and{" "}
            <a className="text-sky-400 underline" href="/report/sample-weak">weak</a> sample scorecards always work.
          </p>
        </div>
      </main>
    );
  }

  if (!s.scorecard) {
    return (
      <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-semibold">Not scored yet</h1>
          <p className="mt-3 text-slate-400">This session hasn&apos;t been submitted for evaluation.</p>
        </div>
      </main>
    );
  }

  return (
    <Report
      sessionId={sessionId}
      scorecard={s.scorecard}
      trace={s.trace}
      dimNames={DIM_NAMES}
      prototypeHtml={s.prototypeHtml ?? ""}
    />
  );
}
