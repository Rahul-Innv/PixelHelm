#!/usr/bin/env node
// lint-typography.mjs — value-range typographic craft linter (Butterick, translated).
// Emits Terrazzo-style structured findings {messageId,ruleRef,node,severity,data,fix}.
// Dependency-free. Static checks only (measure is approximate without a render).
//
// Usage:
//   node lint-typography.mjs <file-or-glob...>          # scan source for quote/dash/space/caps
//   node lint-typography.mjs --leading 1.7              # check a single body line-height value
//   node lint-typography.mjs --size 13                  # check a single body size (px)
//   node lint-typography.mjs --measure 104              # check a rendered measure (ch)
//
// CSS line-height / max-width are best linted on the rendered DOM by pixelhelm-evaluate;
// this script covers the static, regex-able rules + single-value spot checks.

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const LH_MIN = 1.2, LH_MAX = 1.45;          // body leading
const SIZE_MIN = 15, SIZE_MAX = 25;         // body px
const MEASURE_MIN = 45, MEASURE_MAX = 90;   // ch
const CAPS_LS_MIN = 0.05, CAPS_LS_MAX = 0.12; // em

const findings = [];
const add = (f) => findings.push(f);

// ---- single-value spot checks ----
function checkLeading(v) {
  if (v < LH_MIN || v > LH_MAX) add({ messageId: 'leading-out-of-range', ruleRef: 'butterick-3', severity: 'warn', data: { value: v, min: LH_MIN, max: LH_MAX }, fix: `set body line-height between ${LH_MIN} and ${LH_MAX}` });
}
function checkSize(v) {
  if (v < SIZE_MIN || v > SIZE_MAX) add({ messageId: 'body-size-out-of-range', ruleRef: 'butterick-2', severity: 'warn', data: { value: v, min: SIZE_MIN, max: SIZE_MAX }, fix: `set body size between ${SIZE_MIN}px and ${SIZE_MAX}px (step-0 >= 16px preferred)` });
}
function checkMeasure(ch) {
  if (ch > MEASURE_MAX) add({ messageId: 'measure-too-wide', ruleRef: 'butterick-4', severity: 'warn', data: { measuredCh: ch, max: MEASURE_MAX }, fix: 'wrap prose in a container with max-width: 65ch' });
  else if (ch < MEASURE_MIN) add({ messageId: 'measure-too-narrow', ruleRef: 'butterick-4', severity: 'warn', data: { measuredCh: ch, min: MEASURE_MIN }, fix: 'widen the prose container toward ~66ch' });
}

// ---- static source scan ----
const CODE_LINE = /(className=|`|https?:\/\/|import\s|require\(|\bconst\b|\blet\b|\/\/|\/\*)/;
function scanText(file, text) {
  const lines = text.split(/\r?\n/);
  lines.forEach((line, i) => {
    const at = `${file}:${i + 1}`;
    if (CODE_LINE.test(line)) return; // skip likely-code lines (cheap ignore mechanism)
    // straight quotes used as quotation marks (heuristic: quote followed by a letter)
    if (/(^|\s)"[A-Za-z]/.test(line) || /[A-Za-z]"(\s|$|[.,!?])/.test(line))
      add({ messageId: 'straight-quote', ruleRef: 'butterick-7', node: at, severity: 'info', data: { line: line.trim() }, fix: 'use curly “ ” / ‘ ’' });
    // double-hyphen em dash
    if (/\S--\S|\s--\s/.test(line))
      add({ messageId: 'hyphen-as-dash', ruleRef: 'butterick-19', node: at, severity: 'info', data: { line: line.trim() }, fix: 'use — (em) or – (en for ranges)' });
    // space-hyphen-space used as a dash
    if (/\s-\s/.test(line))
      add({ messageId: 'hyphen-as-dash', ruleRef: 'butterick-19', node: at, severity: 'info', data: { line: line.trim() }, fix: 'use — (em dash) for breaks in thought' });
    // straight apostrophe between letters
    if (/[A-Za-z]'[A-Za-z]/.test(line))
      add({ messageId: 'straight-apostrophe', ruleRef: 'butterick-25', node: at, severity: 'info', data: { line: line.trim() }, fix: 'use ’ (U+2019)' });
    // double spaces between sentences
    if (/[.!?]\s{2,}[A-Z]/.test(line) || /\S {2,}\S/.test(line))
      add({ messageId: 'double-space', ruleRef: 'butterick-12', node: at, severity: 'info', data: { line: line.trim() }, fix: 'use a single space' });
  });
  // all-caps style without tracking (CSS heuristic)
  const upper = /text-transform:\s*uppercase/.test(text);
  const hasLs = /letter-spacing:\s*0?\.0[5-9]|letter-spacing:\s*0?\.1[0-2]/.test(text);
  if (upper && !hasLs)
    add({ messageId: 'caps-no-tracking', ruleRef: 'butterick-15', node: file, severity: 'warn', data: { min: CAPS_LS_MIN, max: CAPS_LS_MAX }, fix: 'add letter-spacing 0.05em–0.12em to uppercase runs' });
}

function* walk(p) {
  let s; try { s = statSync(p); } catch { return; }
  if (s.isDirectory()) { for (const e of readdirSync(p)) yield* walk(join(p, e)); }
  else if (/\.(tsx?|jsx?|css|md|mdx|html)$/.test(p)) yield p;
}

function parseArgs(argv) { const a = { _: [] }; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[i + 1]; i++; } else a._.push(argv[i]); } return a; }

if (process.argv[1]?.endsWith('lint-typography.mjs')) {
  const a = parseArgs(process.argv.slice(2));
  if (a.leading) checkLeading(+a.leading);
  if (a.size) checkSize(+a.size);
  if (a.measure) checkMeasure(+a.measure);
  for (const target of a._) for (const f of walk(target)) { try { scanText(f, readFileSync(f, 'utf8')); } catch {} }
  console.log(JSON.stringify({ findings, count: findings.length }, null, 2));
  process.exit(findings.some((f) => f.severity === 'error') ? 1 : 0);
}
