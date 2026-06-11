import { randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import { Session, TraceEvent, PersonaId, Phase } from "./types";

// Persistence model: pure in-memory helpers (createSession / appendEvent /
// spendQuestion / recordFacts) mutate a Session object with zero I/O - easy to
// test and reason about. Only loadSession / saveSession touch a backend. A
// route's shape is: load once → mutate via helpers → save once.
//
// Backend is Redis (Upstash REST) when its env vars are present - required on
// serverless, where separate function instances don't share memory. Falls back
// to an in-process Map for local dev and tests when no Redis is configured.

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

const redis = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

const g = globalThis as unknown as { __pgSessions?: Map<string, Session> };
const memMap = (g.__pgSessions ??= new Map<string, Session>());

const key = (id: string) => `pg:session:${id}`;

export function isRedisBacked(): boolean {
  return redis !== null;
}

export async function loadSession(id: string): Promise<Session | null> {
  if (redis) {
    const data = await redis.get<Session>(key(id));
    return data ?? null;
  }
  return memMap.get(id) ?? null;
}

export async function saveSession(s: Session): Promise<void> {
  if (redis) {
    // 24h TTL - sessions are ephemeral; samples are re-seeded from disk on demand.
    await redis.set(key(s.id), s, { ex: 60 * 60 * 24 });
    return;
  }
  memMap.set(s.id, s);
}

export function createSession(id?: string): Session {
  return {
    id: id ?? `pg-${randomUUID()}`,
    createdAt: Date.now(),
    questionBudget: 20,
    questionsUsed: 0,
    questionsPerPersona: { partner: 0, senior: 0, it: 0, risk: 0 },
    revealedFacts: [],
    trace: [],
    status: "active",
  };
}

export function appendEvent(s: Session, ev: Omit<TraceEvent, "id" | "ts">): TraceEvent {
  const event: TraceEvent = {
    ...ev,
    id: `ev-${String(s.trace.length + 1).padStart(4, "0")}`,
    ts: Date.now(),
  };
  s.trace.push(event);
  return event;
}

export function spendQuestion(s: Session, persona: PersonaId): boolean {
  if (s.questionsUsed >= s.questionBudget) return false;
  s.questionsUsed++;
  s.questionsPerPersona[persona]++;
  return true;
}

export function recordFacts(s: Session, factIds: string[], phase: Phase): void {
  for (const f of factIds) {
    if (s.revealedFacts.includes(f)) continue;
    s.revealedFacts.push(f);
    appendEvent(s, {
      phase,
      actor: "system",
      type: "fact_revealed",
      content: `Hidden fact surfaced: ${f}`,
      refs: [f],
    });
  }
}
