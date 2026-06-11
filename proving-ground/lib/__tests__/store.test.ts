import { describe, it, expect } from "vitest";
import { createSession, appendEvent, spendQuestion, recordFacts } from "../store";

describe("store helpers (pure, in-memory)", () => {
  it("creates a session with a 20-question budget", () => {
    const s = createSession();
    expect(s.questionBudget).toBe(20);
    expect(s.questionsUsed).toBe(0);
    expect(s.status).toBe("active");
  });

  it("appends events with sequential ids", () => {
    const s = createSession();
    appendEvent(s, { phase: "discovery", actor: "candidate", type: "candidate_message", content: "hi" });
    appendEvent(s, { phase: "discovery", actor: "persona:partner", type: "persona_message", content: "hello" });
    expect(s.trace).toHaveLength(2);
    expect(s.trace[0].id).toBe("ev-0001");
    expect(s.trace[1].id).toBe("ev-0002");
  });

  it("enforces the question budget", () => {
    const s = createSession();
    for (let i = 0; i < 20; i++) expect(spendQuestion(s, "partner")).toBe(true);
    expect(spendQuestion(s, "partner")).toBe(false);
    expect(s.questionsUsed).toBe(20);
    expect(s.questionsPerPersona.partner).toBe(20);
  });

  it("records revealed facts once, with trace events", () => {
    const s = createSession();
    recordFacts(s, ["HF-3", "HF-3", "HF-5"], "discovery");
    expect(s.revealedFacts).toEqual(["HF-3", "HF-5"]);
    expect(s.trace.filter((e) => e.type === "fact_revealed")).toHaveLength(2);
  });
});
