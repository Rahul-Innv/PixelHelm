#!/usr/bin/env node
// font-fallback.mjs — emit a metric-matched fallback @font-face that re-shapes a
// local() system font to a web font's metrics, eliminating CLS on font swap.
//
// Formula (Chrome "Improved font fallbacks"), all descriptors as %:
//   size-adjust       = web.avgCharWidth / fallback.avgCharWidth
//   ascent-override   = web.ascent  / (web.unitsPerEm * size-adjust)
//   descent-override  = web.descent / (web.unitsPerEm * size-adjust)
//   line-gap-override = web.lineGap / (web.unitsPerEm * size-adjust)
//
// Metrics MUST come from real font data — a name alone is not enough. Source order:
//   1) @capsizecss/metrics  (if installed: fontMetrics for the web font)
//   2) --metrics <file.json> { unitsPerEm, ascent, descent, lineGap, avgCharWidth }
//   3) khempenius/font-fallbacks-dataset for Google Fonts (precomputed, offline)
// Never hardcode size-adjust: 100% — compute it.
//
// Usage:
//   node font-fallback.mjs --font "Inter" --fallback Arial --metrics inter.json
//   node font-fallback.mjs --font "Inter" --fallback Arial   # tries @capsizecss/metrics

const FALLBACK_AVG = { // avgCharWidth / unitsPerEm for common local() fallbacks
  Arial: 0.5285, 'Times New Roman': 0.4837, Georgia: 0.5106,
  'Courier New': 0.6024, Tahoma: 0.5363, Verdana: 0.5972, Helvetica: 0.5285,
};

const pct = (n) => `${(n * 100).toFixed(2)}%`;

function emit({ webName, fallbackName, m }) {
  const webAvg = m.avgCharWidth / m.unitsPerEm;
  const fbAvg = FALLBACK_AVG[fallbackName] ?? FALLBACK_AVG.Arial;
  const sizeAdjust = webAvg / fbAvg;
  const ascent = m.ascent / (m.unitsPerEm * sizeAdjust);
  const descent = m.descent / (m.unitsPerEm * sizeAdjust);
  const lineGap = m.lineGap / (m.unitsPerEm * sizeAdjust);
  return `@font-face {
  font-family: '${webName}-fallback';
  src: local('${fallbackName}');
  size-adjust: ${pct(sizeAdjust)};
  ascent-override: ${pct(ascent)};
  descent-override: ${pct(descent)};
  line-gap-override: ${pct(lineGap)};
}
/* stack: font-family: '${webName}', '${webName}-fallback', system-ui, sans-serif; */`;
}

async function loadMetrics(font, metricsPath) {
  if (metricsPath) {
    const { readFileSync } = await import('node:fs');
    return JSON.parse(readFileSync(metricsPath, 'utf8'));
  }
  try {
    const cap = await import('@capsizecss/metrics');
    const m = cap.fontMetrics ? cap.fontMetrics(font) : null;
    if (m) return { unitsPerEm: m.unitsPerEm, ascent: m.ascent, descent: Math.abs(m.descent), lineGap: m.lineGap, avgCharWidth: m.xWidthAvg };
  } catch {}
  return null;
}

function parseArgs(argv) { const a = {}; for (let i = 0; i < argv.length; i++) { if (argv[i].startsWith('--')) { a[argv[i].slice(2)] = argv[i + 1]; i++; } } return a; }

if (process.argv[1]?.endsWith('font-fallback.mjs')) {
  const a = parseArgs(process.argv.slice(2));
  const webName = a.font; const fallbackName = a.fallback || 'Arial';
  if (!webName) { console.error('error: --font is required'); process.exit(2); }
  const m = await loadMetrics(webName, a.metrics);
  if (!m) {
    console.error(`error: no metrics for "${webName}". Provide --metrics <file.json> with {unitsPerEm,ascent,descent,lineGap,avgCharWidth},`);
    console.error('       or install @capsizecss/metrics, or use khempenius/font-fallbacks-dataset for Google Fonts. Do NOT hardcode size-adjust: 100%.');
    process.exit(1);
  }
  console.log(emit({ webName, fallbackName, m }));
}
