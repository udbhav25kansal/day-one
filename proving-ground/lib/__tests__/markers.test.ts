import { describe, it, expect } from "vitest";
import { extractMarkers } from "../markers";

describe("extractMarkers", () => {
  it("strips markers and returns fact ids", () => {
    const r = extractMarkers("The ERP changed format last fall. ⟦HF-3⟧⟦HF-4⟧");
    expect(r.cleaned).toBe("The ERP changed format last fall.");
    expect(r.factIds).toEqual(["HF-3", "HF-4"]);
  });
  it("handles replies with no markers", () => {
    const r = extractMarkers("Clients are just slow.");
    expect(r.cleaned).toBe("Clients are just slow.");
    expect(r.factIds).toEqual([]);
  });
  it("only accepts known ledger ids", () => {
    const r = extractMarkers("Sure. ⟦HF-99⟧");
    expect(r.factIds).toEqual([]);
    expect(r.cleaned).toBe("Sure.");
  });
});
