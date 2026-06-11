export const SCENARIO = {
  title: "Maple & Birch LLP - Audit Delivery Engagement",
  brief: `Maple & Birch LLP is a Canadian professional services firm (~8,000 staff, Big Four affiliate).
The audit practice's engagement teams are missing internal deadlines on disclosure-checklist
completion and evidence vouching. Partners blame staffing; staff blame the tools; IT blames
data access; Risk is nervous about a regulatory review.

Leadership has asked: "Where could AI agents actually help?"

Your job: interview the stakeholders, find the real problem, and propose + prototype what to
build. You have 20 questions total across all four stakeholders. Spend them well.`,
};

export const HIDDEN_FACTS_LEDGER: Record<
  string,
  { owner: string; importance: "critical" | "useful"; summary: string }
> = {
  "HF-1": {
    owner: "partner",
    importance: "critical",
    summary:
      "Previous automation pilot failed 18 months ago; partner holds an implicit veto on new vendor integrations",
  },
  "HF-2": {
    owner: "partner",
    importance: "useful",
    summary: "Partner believes the root cause is staffing, not tooling (she is wrong)",
  },
  "HF-3": {
    owner: "senior",
    importance: "critical",
    summary:
      "Root cause is an ERP data-format change 8 months ago, not client responsiveness; the Senior has a manual workaround he never escalated",
  },
  "HF-4": {
    owner: "senior",
    importance: "useful",
    summary: "Senior has heard of an internal IT API that might already solve this",
  },
  "HF-5": {
    owner: "it",
    importance: "critical",
    summary:
      "A production evidence-retrieval API already normalizes 12 ERP formats, including the one causing the bottleneck",
  },
  "HF-6": {
    owner: "it",
    importance: "useful",
    summary: "Consumer AI tools are already in shadow use on 4+ engagement teams",
  },
  "HF-7": {
    owner: "risk",
    importance: "critical",
    summary:
      "CPAB thematic review of AI-in-audit is 6 weeks away; undocumented AI tools would generate a comment form",
  },
  "HF-8": {
    owner: "risk",
    importance: "useful",
    summary: "The EQR sign-off bottleneck is reviewer overload; earlier-signal tooling would actually help",
  },
};

export const CRITICAL_FACTS = ["HF-1", "HF-3", "HF-5", "HF-7"];
