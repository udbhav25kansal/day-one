import { NextResponse } from "next/server";
import { loadSession } from "@/lib/store";
import { ensureSamplesLoaded } from "@/lib/samples";

export async function GET(_req: Request, ctx: { params: Promise<{ sessionId: string }> }) {
  await ensureSamplesLoaded();
  const { sessionId } = await ctx.params;
  const s = await loadSession(sessionId);
  if (!s) return NextResponse.json({ error: "unknown session" }, { status: 404 });
  return NextResponse.json({ session: s });
}
