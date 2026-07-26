#!/usr/bin/env node
// motif-grep.mjs — E2 metric (c), mechanical half. Registered checklist of 20
// motifs; this script decides the GREPPABLE subset mechanically from committed
// code, as the sheet allows. Declared split (fixed here, before measurement):
//   Mechanical (this script): 1 sticky header; 5 data table with ruled rows;
//     10 tabbed sections; 11 accordion/disclosure; 16 gradient wash;
//     17 glass/blur panel.
//   Visual (majority of the 5 blind judges): 2 hero image/illustration;
//     3 status pill/badge chips; 4 card grid; 6 map/terrain graphic;
//     7 sparkline/mini-chart; 8 big-number stat row; 9 timeline/strip
//     calendar; 12 filter or segment control; 13 legend block; 14 icon-led
//     list rows; 15 full-bleed section color inversion; 18 oversized display
//     typography; 19 duotone/monochrome photography; 20 decorative texture.
// Output: per-arm partial binary vector for the mechanical motifs.
// Usage: node motif-grep.mjs <arm.html> [...]
import { readFileSync } from "node:fs";
import { basename, dirname } from "node:path";

const RULES = {
  "1-sticky-header": (t) => /position:\s*(sticky|fixed)/i.test(t),
  "5-data-table-ruled": (t) => /<table\b/i.test(t),
  "10-tabs": (t) => /role="tab(list)?"/i.test(t),
  "11-accordion": (t) => /<details\b|aria-expanded=/i.test(t),
  "16-gradient-wash": (t) => /(linear|radial|conic)-gradient\(/i.test(t),
  "17-glass-blur": (t) => /backdrop-filter/i.test(t),
};
const out = {};
for (const file of process.argv.slice(2)) {
  const t = readFileSync(file, "utf8");
  out[basename(dirname(file))] = Object.fromEntries(Object.entries(RULES).map(([k, fn]) => [k, fn(t)]));
}
console.log(JSON.stringify({ metric: "E2(c) motifs - mechanical subset", results: out }, null, 2));
