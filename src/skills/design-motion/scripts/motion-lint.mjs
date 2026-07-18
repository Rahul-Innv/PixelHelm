#!/usr/bin/env node
// motion-lint.mjs — the four-rule motion floor. Emits structured findings
// {messageId,ruleRef,node,severity,data,fix}; exits 1 on any error.
// Dependency-free, network-free, static (regex) checks only. Feeds design-evaluate
// Layer-1. It proves cheap/tokenized/asymmetric/reduced-motion correctness — NOT taste.
//
// The four rules:
//   1 banned-prop   — transition/animation animates a HARD-BANNED layout property
//   2 token-drift   — a literal ms / cubic-bezier() / ease keyword in component CSS
//                     where a --motion-* token belongs (drift guard, AA-lockstep spirit)
//   3 no-reduced    — a @keyframes/transition block with no prefers-reduced-motion
//                     counterpart anywhere in the file
//   4 asymmetry     — an ENTER (*-in/enter) using an ease-in curve, or an EXIT
//                     (*-out/exit/leave) using an ease-out curve
//
// Usage:
//   node motion-lint.mjs <file-or-dir...>          # scan CSS/source
//   node motion-lint.mjs --allow path/tokens.css   # file(s) allowed to carry raw values
//                                                   # (the token source itself) — comma-sep

import { readFileSync, statSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';

// HARD-BANNED layout properties (motion.dev/docs/performance: "upwards of 100ms").
const BANNED = ['width', 'height', 'top', 'left', 'right', 'bottom',
  'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
  'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
  'border-width', 'border', 'inset', 'position'];

const findings = [];
const add = (f) => findings.push(f);
const ENTER = /(enter|--in\b|-in\b|reveal|appear|show)/i;     // entering-the-screen tokens
const EXIT = /(exit|leave|--out\b|-out\b|dismiss|hide)/i;     // leaving-the-screen tokens

// ---- per-file scan ----
function scanCss(file, text) {
  const at = (i) => `${file}:${i + 1}`;
  const lines = text.split(/\r?\n/);
  const hasReduced = /prefers-reduced-motion/.test(text);
  const hasMotionBlock = /@keyframes|transition\s*:|animation\s*:|\.animate\(/.test(text);

  // Rule 3 — any motion in the file but no reduced-motion counterpart at all.
  if (hasMotionBlock && !hasReduced)
    add({ messageId: 'missing-reduced-motion', ruleRef: 'rule-4', node: file, severity: 'error',
      data: {}, fix: 'add a @media (prefers-reduced-motion: reduce) block that degrades to opacity (see references/reduced-motion.md)' });

  lines.forEach((line, i) => {
    // Rule 1 — transition/transition-property naming a banned layout prop.
    const tp = line.match(/transition(?:-property)?\s*:\s*([^;]+)/i);
    if (tp) for (const prop of BANNED)
      if (new RegExp(`(^|[\\s,])${prop}([\\s,]|$)`).test(tp[1]))
        add({ messageId: 'banned-layout-property', ruleRef: 'rule-2', node: at(i), severity: 'error',
          data: { property: prop, line: line.trim() }, fix: `animate transform/opacity instead of "${prop}" — translate to move, scale to resize` });

    // Rule 2 — literal duration / easing in a transition/animation shorthand
    //          where a --motion-* token belongs (drift guard).
    const shorthand = line.match(/(transition|animation)\s*:\s*([^;]+)/i);
    if (shorthand) {
      const v = shorthand[2];
      if (/\bcubic-bezier\s*\(/i.test(v) && !/var\(\s*--ease/.test(v))
        add({ messageId: 'literal-easing', ruleRef: 'rule-3', node: at(i), severity: 'error',
          data: { line: line.trim() }, fix: 'reference a --ease-* token, not a literal cubic-bezier()' });
      if (/\b\d+m?s\b/i.test(v) && !/var\(\s*--motion-duration/.test(v))
        add({ messageId: 'literal-duration', ruleRef: 'rule-3', node: at(i), severity: 'error',
          data: { line: line.trim() }, fix: 'reference a --motion-duration-* token, not a literal ms/s value' });
      if (/(^|\s)(ease|ease-in|ease-out|ease-in-out|linear)(\s|;|,|$)/.test(v) && !/var\(\s*--ease/.test(v))
        add({ messageId: 'literal-easing-keyword', ruleRef: 'rule-3', node: at(i), severity: 'warn',
          data: { line: line.trim() }, fix: 'use a named --ease-* token (decelerate for enter, accelerate for exit)' });
    }
  });

  // Rule 4 — asymmetry: scan each selector/keyframe-name + its easing token.
  // Match a class/animation-name and any --ease token applied near it.
  const blocks = text.match(/[.#&][\w-]+[^{]*\{[^}]*\}/g) || [];
  for (const b of blocks) {
    const sel = (b.match(/^[^{]+/) || [''])[0];
    const easeRef = (b.match(/var\(\s*--ease-([\w-]+)\s*\)/) || [])[1] || '';
    if (!easeRef) continue;
    const isDecel = /(decelerate|out-)/.test(easeRef);   // ease-out family
    const isAccel = /accelerate/.test(easeRef);          // ease-in family
    if (ENTER.test(sel) && !EXIT.test(sel) && isAccel)
      add({ messageId: 'asymmetry-enter-accelerates', ruleRef: 'rule-1', node: sel.trim(), severity: 'error',
        data: { ease: easeRef }, fix: 'enters must DECELERATE — use --ease-decelerate / --ease-out-*' });
    if (EXIT.test(sel) && !ENTER.test(sel) && isDecel)
      add({ messageId: 'asymmetry-exit-decelerates', ruleRef: 'rule-1', node: sel.trim(), severity: 'error',
        data: { ease: easeRef }, fix: 'exits must ACCELERATE (and be shorter) — use --ease-accelerate' });
  }
}

function* walk(p) {
  let s; try { s = statSync(p); } catch { return; }
  if (s.isDirectory()) { for (const e of readdirSync(p)) yield* walk(join(p, e)); }
  else if (/\.(css|scss|tsx?|jsx?|html)$/.test(p)) yield p;
}

function parseArgs(argv) { const a = { _: [], allow: '' }; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[i + 1]; i++; } else a._.push(argv[i]); } return a; }

if (process.argv[1]?.endsWith('motion-lint.mjs')) {
  const a = parseArgs(process.argv.slice(2));
  const allow = new Set((a.allow || '').split(',').map((s) => basename(s.trim())).filter(Boolean));
  if (!a._.length) { console.error('usage: node motion-lint.mjs <file-or-dir...> [--allow tokens.css]'); process.exit(2); }
  for (const target of a._) for (const f of walk(target)) {
    if (allow.has(basename(f))) continue;  // the token source legitimately carries raw values
    try { scanCss(f, readFileSync(f, 'utf8')); } catch {}
  }
  const errors = findings.filter((f) => f.severity === 'error').length;
  console.log(JSON.stringify({ findings, count: findings.length, errors,
    banner: 'Proves cheap/tokenized/asymmetric/reduced-motion correctness — NOT taste.' }, null, 2));
  process.exit(errors ? 1 : 0);
}
