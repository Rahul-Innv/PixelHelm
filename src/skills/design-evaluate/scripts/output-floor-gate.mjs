#!/usr/bin/env node
// output-floor-gate.mjs — Layer-1 HARD gate: the structural output floor every shipped
// page must clear (landmarks / heading hierarchy / meta description).
//
// Usage:  node output-floor-gate.mjs <file.html> [...] [--json]
//
// Born from a real escape: the Harborline worked example shipped with no landmarks,
// styled-div section titles, and no meta description — documented as gaps, but nothing
// blocked them. This gate encodes those gaps as machine-certain checks (gate, not advice):
//
//   HARD (exit 1):
//   - landmark-main:     exactly one <main> (or role="main")
//   - h1:                at least one <h1> (more than one is reported, not failed)
//   - heading-order:     no skipped heading level in document order (h2 -> h4 fails)
//   - heading-impostor:  a div/span/p whose class NAMES it a section title/heading
//                        (e.g. class="section-title") is a self-declared heading that is
//                        not markup — a WCAG 1.3.1 info-and-relationships defect
//   - meta-description:  <meta name="description"> present and non-empty
//
//   Reported (never exit 1): multiple <h1>; missing header/nav/footer landmarks; other
//   *-title/*-heading classes on non-heading tags; description length (length rules
//   belong to the seo-meta lens on marketing surfaces).
//
// Static, dependency-free, network-free (local files only). Exit 2 on runner error.
// Spec home: ../references/layer-1-gates.md ("Output floor").

import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const targets = args.filter((a) => !a.startsWith("--"));
if (!targets.length) {
  console.error("usage: node output-floor-gate.mjs <file.html> [...] [--json]");
  process.exit(2);
}

const IMPOSTOR_HARD = /(^|[\s_-])section[-_ ]?(title|heading|header)([\s_-]|$)/i;
const IMPOSTOR_SOFT = /(^|[-_])(title|heading|subtitle|subheading)([-_]|$)/i;

function stripNonMarkup(html) {
  // Drop style/script/comment bodies so CSS selectors ("h1 {…}", ".section-title {")
  // and JS strings never masquerade as document structure.
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
}

function metaContent(html, key) {
  const re1 = new RegExp(`<meta[^>]*\\bname=["']${key}["'][^>]*\\bcontent=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]*\\bcontent=["']([^"']*)["'][^>]*\\bname=["']${key}["']`, "i");
  const m = html.match(re1) || html.match(re2);
  return m ? m[1].trim() : null;
}

function evaluate(rawHtml) {
  const findings = [];
  const add = (level, id, msg) => findings.push({ level, id, msg }); // pass | warn | fail
  const html = stripNonMarkup(rawHtml);

  // Landmarks
  const mains = (html.match(/<main[\s>]/gi) || []).length + (html.match(/\brole=["']main["']/gi) || []).length;
  if (mains === 0) add("fail", "landmark-main", "no <main> landmark (or role=\"main\") — page content has no primary landmark");
  else if (mains > 1) add("fail", "landmark-main", `${mains} main landmarks (want exactly 1)`);
  else add("pass", "landmark-main", "exactly one main landmark");
  const aux = [
    ["header", (html.match(/<header[\s>]/gi) || []).length + (html.match(/\brole=["']banner["']/gi) || []).length],
    ["nav", (html.match(/<nav[\s>]/gi) || []).length + (html.match(/\brole=["']navigation["']/gi) || []).length],
    ["footer", (html.match(/<footer[\s>]/gi) || []).length + (html.match(/\brole=["']contentinfo["']/gi) || []).length],
  ].filter(([, n]) => n === 0).map(([name]) => name);
  if (aux.length) add("warn", "landmark-aux", `no ${aux.join("/")} landmark(s) — confirm the page genuinely has no banner/navigation/footer content`);
  else add("pass", "landmark-aux", "header/nav/footer landmarks present");

  // Heading presence + order
  const headingLevels = [...html.matchAll(/<h([1-6])[\s>]/gi)].map((m) => Number(m[1]));
  const h1s = headingLevels.filter((l) => l === 1).length;
  if (h1s === 0) add("fail", "h1", "no <h1>");
  else if (h1s > 1) add("warn", "h1", `${h1s} <h1> elements (want exactly 1)`);
  else add("pass", "h1", "exactly one <h1>");
  const skips = [];
  for (let i = 1; i < headingLevels.length; i++) {
    if (headingLevels[i] > headingLevels[i - 1] + 1) skips.push(`h${headingLevels[i - 1]} -> h${headingLevels[i]}`);
  }
  if (skips.length) add("fail", "heading-order", `skipped heading level(s): ${[...new Set(skips)].join(", ")}`);
  else if (headingLevels.length) add("pass", "heading-order", `no skipped levels across ${headingLevels.length} heading(s)`);

  // Heading impostors: non-heading tags whose class self-declares "section title".
  const CAP = 20;
  const hard = [];
  const soft = [];
  for (const m of html.matchAll(/<(div|span|p)\b[^>]*\bclass=["']([^"']*)["'][^>]*>/gi)) {
    const cls = m[2];
    if (IMPOSTOR_HARD.test(cls)) hard.push(`<${m[1].toLowerCase()} class="${cls}">`);
    else if (cls.split(/\s+/).some((c) => IMPOSTOR_SOFT.test(c))) soft.push(`<${m[1].toLowerCase()} class="${cls}">`);
  }
  if (hard.length) add("fail", "heading-impostor", `${hard.length} styled-div section title(s) that should be heading markup: ${hard.slice(0, CAP).join(", ")}`);
  else add("pass", "heading-impostor", "no self-declared section-title divs");
  if (soft.length) add("warn", "heading-impostor-soft", `${soft.length} *-title/*-heading class(es) on non-heading tags — review whether they are semantic headings: ${soft.slice(0, 5).join(", ")}`);

  // Meta description (presence is the floor; length rules belong to the seo-meta lens)
  const desc = metaContent(rawHtml, "description");
  if (desc === null || desc === "") add("fail", "meta-description", "no <meta name=\"description\"> (or empty content)");
  else add("pass", "meta-description", `meta description present (${desc.length} chars)`);

  return findings;
}

const report = { validator: "output-floor-gate", generated: new Date().toISOString(), targets: [], pass: true };
for (const t of targets) {
  try {
    const findings = evaluate(readFileSync(t, "utf8"));
    if (findings.some((f) => f.level === "fail")) report.pass = false;
    report.targets.push({ target: t, findings });
  } catch (e) {
    console.error(`output-floor-gate: cannot read ${t}: ${e.message}`);
    process.exit(2);
  }
}

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const MARK = { pass: "PASS", warn: "warn", fail: "FAIL" };
  const L = ["design-evaluate · output-floor gate (HARD) · landmarks / headings / meta description"];
  for (const r of report.targets) {
    L.push(`  ${r.target}`);
    for (const f of r.findings) L.push(`    [${MARK[f.level]}] ${f.id}: ${f.msg}`);
  }
  L.push(`  RESULT: ${report.pass ? "PASS" : "FAIL — the output floor is not met"}`);
  console.log(L.join("\n"));
}
process.exit(report.pass ? 0 : 1);
