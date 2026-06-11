import { describe, it, expect } from "vitest";
import { assembleScorecard, runAudit } from "../judge";
import { createSession, appendEvent, recordFacts, spendQuestion } from "../store";
import { DimensionScore } from "../types";

const ds = (id: string, score: 1 | 2 | 3 | 4): DimensionScore => ({
  dimension: id,
  score,
  confidence: "high",
  evidence: [],
  counterEvidence: "",
  rationale: "",
});

describe("judge assembly", () => {
  it("computes weighted total for senior-consultant profile", () => {
    const s = createSession();
    const scores = ["D1", "D2", "D3", "D4", "D5", "D6"].map((d) => ds(d, 4));
    const card = assembleScorecard(s, scores, "senior-consultant", null);
    expect(card.weightedTotal).toBeCloseTo(4.0);
  });

  it("gate caps the total", () => {
    const s = createSession();
    const scores = ["D1", "D2", "D3", "D4", "D5", "D6"].map((d) => ds(d, 4));
    const card = assembleScorecard(s, scores, "senior-consultant", "Fabricated stakeholder facts");
    expect(card.gateTriggered).toBe("Fabricated stakeholder facts");
    expect(card.weightedTotal).toBeLessThanOrEqual(2.0);
  });

  it("audit counts critical facts and question economy", () => {
    const s = createSession();
    spendQuestion(s, "senior");
    spendQuestion(s, "it");
    recordFacts(s, ["HF-3", "HF-5", "HF-2"], "discovery");
    appendEvent(s, { phase: "build", actor: "candidate", type: "component_used", content: "erp-normalizer" });
    const audit = runAudit(s);
    expect(audit.criticalFactsFound).toEqual(["HF-3", "HF-5"]);
    expect(audit.usefulFactsFound).toEqual(["HF-2"]);
    expect(audit.questionsUsed).toBe(2);
    expect(audit.componentsReused).toBe(1);
  });
});
