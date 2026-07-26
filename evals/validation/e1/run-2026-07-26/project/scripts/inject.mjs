#!/usr/bin/env node
// inject.mjs — E1 build-time injector (honesty-gates injector pattern).
// Pure arithmetic on JSON literals from the sealed data file ONLY. Never reads
// the clock, never invents a value. Pages print these constants; the
// derived-claims gate re-diffs the render against data + these constants.
//
// Usage: node inject.mjs   (from the project dir; writes data/derived.json)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const project = dirname(here);
const data = JSON.parse(readFileSync(join(project, "data", "trail-status.json"), "utf8"));

const byStatus = (s) => data.trails.filter((t) => t.status === s);
const openCount = byStatus("open").length;
const cautionCount = byStatus("caution").length;
const closedCount = byStatus("closed").length;
const unreportedCount = byStatus("unreported").length;
const trailCount = data.trails.length;
const reportedCount = trailCount - unreportedCount;
const nullHistoryDays = data.history7d.filter((d) => d.summary === null).length;
const historyDayCount = data.history7d.length;

const derived = {
  _note: "Injected constants — pure arithmetic on sealed-data literals (inject.mjs). The only legal numbers beyond the data file itself.",
  openCount, cautionCount, closedCount, unreportedCount, trailCount, reportedCount,
  nullHistoryDays, historyDayCount,
  globalAllow: [openCount, cautionCount, closedCount, unreportedCount, trailCount,
                reportedCount, nullHistoryDays, historyDayCount],
};
writeFileSync(join(project, "data", "derived.json"), JSON.stringify(derived, null, 2) + "\n");
console.log("derived.json written:", JSON.stringify(derived.globalAllow));
