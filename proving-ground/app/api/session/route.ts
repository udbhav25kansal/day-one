import { NextResponse } from "next/server";
import { createSession, saveSession } from "@/lib/store";
import { SCENARIO } from "@/lib/scenario";

export async function POST() {
  const s = createSession();
  await saveSession(s);
  return NextResponse.json({ sessionId: s.id, brief: SCENARIO.brief, budget: s.questionBudget });
}
