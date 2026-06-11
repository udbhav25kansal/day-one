export const COMPONENT_LIBRARY = [
  { id: "document-retriever", name: "Document Retriever", desc: "Pulls evidence documents from client portals into a normalized store. Already security-reviewed." },
  { id: "erp-normalizer", name: "ERP Format Normalizer", desc: "Maps trial-balance exports from 12 ERP systems to a standard schema." },
  { id: "checklist-engine", name: "Disclosure Checklist Engine", desc: "Tracks checklist item status and flags incomplete disclosures." },
  { id: "human-approval-gate", name: "Human Approval Gate", desc: "Routes agent outputs to a named reviewer for sign-off before downstream effects. Logs the decision." },
  { id: "audit-trail-logger", name: "Audit Trail Logger", desc: "Append-only log of every agent action, input, output, and approver." },
  { id: "evidence-classifier", name: "Evidence Classifier", desc: "Classifies uploaded documents by evidence type and flags mismatches against the request." },
  { id: "deadline-monitor", name: "Deadline Monitor", desc: "Watches PBC/task due dates and escalates per policy." },
];
