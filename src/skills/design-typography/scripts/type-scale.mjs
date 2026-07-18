#!/usr/bin/env node
// type-scale.mjs — generate a fluid two-anchor type scale as rem-kept clamps,
// and gate every step on WCAG SC 1.4.4 (200% zoomability).
//
// Math ported verbatim (in spirit) from trys/utopia-core (MIT) src/index.ts.
// checkWCAG credited to Maxwell Barvian (fluid.style). Dependency-free, portable.
//
// Usage:
//   node type-scale.mjs --min-width 320 --max-width 1240 --min-size 18 --max-size 20 \
//        --min-scale 1.2 --max-scale 1.25 --positive 5 --negative 2 [--relative-to viewport|container|vi]
//   node type-scale.mjs --selftest   # assert the known regression vectors
//
// Output: JSON { steps: [{step,label,minFontSize,maxFontSize,wcagViolation,clamp}], css }
// REM INVARIANT: clamps are always emitted in rem (never px-only) for user zoom.

const lerp = (x, y, a) => x * (1 - a) + y * a;
const clamp01 = (a, min = 0, max = 1) => Math.min(max, Math.max(min, a));
const invlerp = (x, y, a) => clamp01((a - x) / (y - x));
const range = (x1, y1, x2, y2, a) => lerp(x2, y2, invlerp(x1, y1, a));
const round = (n) => Math.round((n + Number.EPSILON) * 10000) / 10000;

const REL = { viewport: 'vw', container: 'cqi', vi: 'vi', 'viewport-width': 'vw' };

export function calculateClamp({ minSize, maxSize, minWidth, maxWidth, usePx = false, relativeTo = 'viewport-width' }) {
  const isNeg = minSize > maxSize;
  const min = isNeg ? maxSize : minSize;
  const max = isNeg ? minSize : maxSize;
  const divider = usePx ? 1 : 16;
  const unit = usePx ? 'px' : 'rem';
  const relUnit = REL[relativeTo] || 'vw';
  const slope = ((maxSize / divider) - (minSize / divider)) / ((maxWidth / divider) - (minWidth / divider));
  const intersection = (-1 * (minWidth / divider)) * slope + (minSize / divider);
  return `clamp(${round(min / divider)}${unit}, ${round(intersection)}${unit} + ${round(slope * 100)}${relUnit}, ${round(max / divider)}${unit})`;
}

// WCAG SC 1.4.4 zoomability checker (Barvian). Returns [from,to] failing viewport px or null.
export function checkWCAG({ min, max, minWidth, maxWidth }) {
  if (minWidth > maxWidth) { [minWidth, maxWidth] = [maxWidth, minWidth]; [min, max] = [max, min]; }
  const slope = (max - min) / (maxWidth - minWidth);
  const intercept = min - minWidth * slope;
  const lh = (5 * min - 2 * intercept) / (2 * slope);
  const rh = (5 * intercept - 2 * max) / (-1 * slope);
  const lh2 = (3 * intercept) / slope;
  let fail = [];
  if (maxWidth < 5 * minWidth) {
    if (minWidth < lh && lh < maxWidth) fail.push(Math.max(lh, minWidth), maxWidth);
    if (5 * min < 2 * max) fail.push(maxWidth, 5 * minWidth);
    if (5 * minWidth < rh && rh < 5 * maxWidth) fail.push(5 * minWidth, Math.min(rh, 5 * maxWidth));
  } else {
    if (minWidth < lh && lh < 5 * minWidth) fail.push(Math.max(lh, minWidth), 5 * minWidth);
    if (5 * minWidth < lh2 && lh2 < maxWidth) fail.push(Math.max(lh2, 5 * minWidth), maxWidth);
    if (maxWidth < rh && rh < 5 * maxWidth) fail.push(maxWidth, Math.min(rh, 5 * maxWidth));
  }
  if (fail.length) { fail = [fail[0], fail[fail.length - 1]]; if (Math.abs(fail[1] - fail[0]) < 0.1) return null; }
  return fail.length ? fail : null;
}

const sizeAt = (c, vp, step) => {
  const scale = range(c.minWidth, c.maxWidth, c.minScale, c.maxScale, vp);
  const fs = range(c.minWidth, c.maxWidth, c.minSize, c.maxSize, vp);
  return fs * Math.pow(scale, step);
};

const labelFor = (s) => (s === 0 ? 'base' : s > 0 ? `+${s}` : `${s}`);

export function calculateTypeScale(c) {
  const steps = [];
  for (let s = c.positive; s >= -c.negative; s--) {
    const minFS = sizeAt(c, c.minWidth, s);
    const maxFS = sizeAt(c, c.maxWidth, s);
    const w = checkWCAG({ min: minFS, max: maxFS, minWidth: c.minWidth, maxWidth: c.maxWidth });
    steps.push({
      step: s,
      label: labelFor(s),
      minFontSize: round(minFS),
      maxFontSize: round(maxFS),
      wcagViolation: w ? { from: Math.round(w[0]), to: Math.round(w[1]) } : null,
      clamp: calculateClamp({ minSize: minFS, maxSize: maxFS, minWidth: c.minWidth, maxWidth: c.maxWidth, relativeTo: c.relativeTo }),
    });
  }
  return steps;
}

function toCss(steps) {
  const lines = steps.slice().reverse().map((s) => `  --step-${String(s.step).replace('-', '-')}: ${s.clamp};`);
  return `:root {\n${lines.join('\n')}\n}`;
}

function parseArgs(argv) {
  const a = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) { const k = argv[i].slice(2); const v = argv[i + 1]; a[k] = v; i++; }
  }
  return a;
}

function selftest() {
  const cases = [
    [calculateClamp({ minSize: 16, maxSize: 32, minWidth: 320, maxWidth: 1240 }), 'clamp(1rem, 0.6522rem + 1.7391vw, 2rem)'],
    [calculateClamp({ minSize: 16, maxSize: 32, minWidth: 320, maxWidth: 1240, usePx: true }), 'clamp(16px, 10.4348px + 1.7391vw, 32px)'],
    [calculateClamp({ minSize: 16, maxSize: 32, minWidth: 320, maxWidth: 1240, relativeTo: 'container' }), 'clamp(1rem, 0.6522rem + 1.7391cqi, 2rem)'],
  ];
  let ok = true;
  for (const [got, want] of cases) { if (got !== want) { ok = false; console.error(`FAIL\n  got:  ${got}\n  want: ${want}`); } }
  if (ok) console.log('selftest OK (3 regression vectors match)');
  process.exit(ok ? 0 : 1);
}

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('type-scale.mjs')) {
  const a = parseArgs(process.argv.slice(2));
  if ('selftest' in a) selftest();
  const c = {
    minWidth: +(a['min-width'] ?? 320), maxWidth: +(a['max-width'] ?? 1240),
    minSize: +(a['min-size'] ?? 18), maxSize: +(a['max-size'] ?? 20),
    minScale: +(a['min-scale'] ?? 1.2), maxScale: +(a['max-scale'] ?? 1.25),
    positive: +(a.positive ?? 5), negative: +(a.negative ?? 2),
    relativeTo: a['relative-to'] ?? 'viewport-width',
  };
  const steps = calculateTypeScale(c);
  const violations = steps.filter((s) => s.wcagViolation);
  if (violations.length) {
    console.error('WCAG 1.4.4 FAIL — these steps cannot reach 200% zoom across the viewport range:');
    for (const v of violations) console.error(`  step ${v.step}: fails between ${v.wcagViolation.from}px and ${v.wcagViolation.to}px`);
  }
  console.log(JSON.stringify({ steps, css: toCss(steps), wcagPass: violations.length === 0 }, null, 2));
}
