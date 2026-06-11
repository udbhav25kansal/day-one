export type Phase = "brief" | "discovery" | "synthesis" | "build" | "boardroom" | "final";

export type PersonaId = "partner" | "senior" | "it" | "risk";

export type EventType =
  | "candidate_message"
  | "persona_message"
  | "panel_query"
  | "panel_reply"
  | "build_prompt"
  | "build_reply"
  | "component_used"
  | "component_contributed"
  | "fact_revealed"
  | "synthesis_saved"
  | "spec_saved"
  | "prototype_built"
  | "boardroom_message"
  | "revision_saved"
  | "submitted";

export interface TraceEvent {
  id: string;
  ts: number;
  phase: Phase;
  actor: string;
  type: EventType;
  content: string;
  refs?: string[];
}

export interface SynthesisDoc {
  realProblem: string;
  optimizingFor: string;
  notSolving: string;
  assumptions: string;
  successMetrics: string;
}

export interface SpecDoc {
  workflowSteps: string;
  autonomyBoundaries: string;
  dataTouched: string;
  failureModes: string;
  evalPlan: string;
  reusableComponent: string;
  whatILeftOut: string;
}

export interface DimensionScore {
  dimension: string;
  score: 1 | 2 | 3 | 4;
  confidence: "low" | "medium" | "high";
  evidence: { quote: string; eventId: string }[];
  counterEvidence: string;
  rationale: string;
  humanOverride?: { score: number; reason: string };
}

export interface Scorecard {
  dimensions: DimensionScore[];
  audit: {
    criticalFactsFound: string[];
    usefulFactsFound: string[];
    questionsUsed: number;
    questionsPerPersona: Record<PersonaId, number>;
    componentsReused: number;
    revisedAfterBoardroom: boolean;
  };
  gateTriggered: string | null;
  weightedTotal: number;
  profile: "senior-consultant" | "manager";
}

export interface Session {
  id: string;
  createdAt: number;
  questionBudget: number;
  questionsUsed: number;
  questionsPerPersona: Record<PersonaId, number>;
  revealedFacts: string[];
  trace: TraceEvent[];
  synthesis?: SynthesisDoc;
  spec?: SpecDoc;
  prototypeHtml?: string;
  status: "active" | "submitted" | "scored";
  scorecard?: Scorecard;
  isSample?: boolean;
}
