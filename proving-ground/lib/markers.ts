import { HIDDEN_FACTS_LEDGER } from "./scenario";

export function extractMarkers(text: string): { cleaned: string; factIds: string[] } {
  const factIds: string[] = [];
  const cleaned = text
    .replace(/⟦(HF-\d+)⟧/g, (_, id: string) => {
      if (HIDDEN_FACTS_LEDGER[id]) factIds.push(id);
      return "";
    })
    .trim();
  return { cleaned, factIds };
}
