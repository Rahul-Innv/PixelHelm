// check-token-contracts.mjs — recompute WCAG AA on each candidate's embedded #token-contract.
// Layer-1 machine gate for NEW-PALETTE tournament candidates (design-generate embeds the block;
// this script proves the proposed palette before any taste judgment).
//
// Usage: node check-token-contracts.mjs <file.html | dir> [more files/dirs...]
//   A directory argument checks every *.html directly inside it (not recursive).
//
// Contract shape each candidate embeds (authoring rules in design-generate SKILL.md —
// gate MEANING-BEARING pairs only, never decorative hairlines):
//   <script type="application/json" id="token-contract">
//     { "light": { "<name>": "#hex", ... }, "dark": { ... },
//       "gatedPairs": [ { "fg": "<name>", "on": ["<name>", ...], "kind": "text" | "graphic" } ] }
//   </script>
//
// PASS floor: text >= 4.5, graphic >= 3.0 (the standard profile gate kinds). A missing block,
// invalid JSON, or an unresolvable token name is a FAIL — never silently skipped. Exit 1 on any FAIL.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
if (!args.length) {
  console.error("usage: node check-token-contracts.mjs <file.html | dir> [more...]");
  process.exit(2);
}
const files = [];
for (const a of args) {
  let st;
  try { st = statSync(a); } catch { console.error(`check-token-contracts: no such path: ${a}`); process.exit(2); }
  if (st.isDirectory()) files.push(...readdirSync(a).filter((f) => f.endsWith(".html")).sort().map((f) => join(a, f)));
  else files.push(a);
}
if (!files.length) { console.error("check-token-contracts: no .html files found"); process.exit(2); }

const hexToRgb = (h) => {
  let s = h.trim().replace(/^#/, "");
  if (s.length === 3) s = [...s].map((c) => c + c).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) return null;
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
};
const lum = ([r, g, b]) => {
  const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

let anyFail = false;
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const m = html.match(/<script[^>]*id="token-contract"[^>]*>([\s\S]*?)<\/script>/i);
  if (!m) { console.log(`${file}: FAIL — no #token-contract block`); anyFail = true; continue; }
  let c;
  try { c = JSON.parse(m[1]); } catch (e) { console.log(`${file}: FAIL — contract JSON invalid: ${e.message}`); anyFail = true; continue; }
  if (!c.light || !c.dark || !Array.isArray(c.gatedPairs)) { console.log(`${file}: FAIL — contract missing light/dark/gatedPairs`); anyFail = true; continue; }
  let pass = 0, fail = 0, skip = 0; const fails = [];
  for (const mode of ["light", "dark"]) {
    for (const p of c.gatedPairs) {
      const floor = p.kind === "graphic" ? 3.0 : 4.5;
      const fg = hexToRgb(String(c[mode][p.fg] ?? ""));
      for (const onName of p.on || []) {
        const bg = hexToRgb(String(c[mode][onName] ?? ""));
        if (!fg || !bg) { skip++; fails.push(`${mode} ${p.fg}/${onName}: unresolvable value`); continue; }
        const r = ratio(fg, bg);
        if (r >= floor) pass++;
        else { fail++; fails.push(`${mode} ${p.fg} on ${onName}: ${r.toFixed(2)} < ${floor}`); }
      }
    }
  }
  const verdict = fail === 0 && skip === 0 ? "PASS" : "FAIL";
  if (verdict === "FAIL") anyFail = true;
  console.log(`${file}: ${verdict} — ${pass} pass / ${fail} fail / ${skip} unresolvable (pairs×modes)`);
  for (const line of fails) console.log(`    ${line}`);
}
process.exit(anyFail ? 1 : 0);
