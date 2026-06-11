import fs from "fs";
import path from "path";
import { Session } from "./types";
import { loadSession, saveSession } from "./store";

// Seeded strong/weak sample runs are generated once via scripts/generate-sample.ts
// (which drives the real pipeline) and written to data/*.json. They are loaded into
// the session store on first access so reviewers can open the scorecards without
// running a live session.
const SAMPLE_IDS = ["sample-strong", "sample-weak"];
let loaded = false;

export async function ensureSamplesLoaded(): Promise<void> {
  if (loaded) return;
  loaded = true;
  for (const id of SAMPLE_IDS) {
    if (await loadSession(id)) continue;
    try {
      const file = path.join(process.cwd(), "data", `${id}.json`);
      const raw = fs.readFileSync(file, "utf8");
      const session = JSON.parse(raw) as Session;
      session.id = id; // force the stable id regardless of what was recorded
      session.isSample = true;
      await saveSession(session);
    } catch {
      // sample not generated yet - fine, the report page will show "not found"
    }
  }
}
