#!/usr/bin/env node
// seo-meta.mjs — scope-B SEO / share-meta lens (MARKETING SURFACES ONLY).
//
// Usage:  node seo-meta.mjs <url|htmlfile> [<url|htmlfile> ...] [--json] [--strict]
//
// SURFACE-TRIGGERED: run this ONLY for a real marketing web page (profile.surfaceType === "marketing").
// It is meaningless for an in-shell app screen, a data view, or an email — do NOT fire it there.
//
// Checks (advisory by default; each maps to power-design web-rule #20 + Open Graph / schema.org):
//   - <title> present, length <= 60 chars (Google truncates ~60)
//   - <meta name="description"> present, length <= 155 chars (warn 156-160, fail > 160 / missing)
//   - <link rel="canonical"> present + absolute
//   - Open Graph: og:title, og:description, og:image present; og:image:width/height = 1200x630 (warn if other/absent)
//   - twitter:card present
//   - JSON-LD (<script type="application/ld+json">) present AND every block parses
//   - exactly one <h1> (SEO + a11y)
//
// Dependency-free, Node ESM. Exit 0 always (advisory) unless --strict, which exits 1 on any FAIL.
// This lens NEVER changes the exit of the Layer-1 contrast gate; it is reported alongside it.

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const strict = args.includes("--strict");
const targets = args.filter((a) => !a.startsWith("--"));

if (!targets.length) {
  console.error("usage: node seo-meta.mjs <url|htmlfile> [...] [--json] [--strict]");
  process.exit(2);
}

// Thresholds (cited in references/scope-b-marketing-lenses.md).
const TITLE_MAX = 60;
const DESC_IDEAL = 155;
const DESC_MAX = 160;
const OG_W = 1200;
const OG_H = 630;

async function loadHtml(target) {
  if (/^https?:\/\//i.test(target)) {
    const res = await fetch(target, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${target}`);
    return await res.text();
  }
  const { readFileSync } = await import("node:fs");
  return readFileSync(target, "utf8");
}

// --- tiny dependency-free head parsers (case-insensitive, attribute-order-agnostic) ---
function tag(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : null;
}
function metaContent(html, key, attr = "name") {
  // <meta name="description" content="..."> in either attribute order.
  const re1 = new RegExp(`<meta[^>]*\\b${attr}=["']${key}["'][^>]*\\bcontent=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<meta[^>]*\\bcontent=["']([^"']*)["'][^>]*\\b${attr}=["']${key}["']`, "i");
  return tag(html, re1) ?? tag(html, re2);
}
function linkHref(html, rel) {
  const re1 = new RegExp(`<link[^>]*\\brel=["']${rel}["'][^>]*\\bhref=["']([^"']*)["']`, "i");
  const re2 = new RegExp(`<link[^>]*\\bhref=["']([^"']*)["'][^>]*\\brel=["']${rel}["']`, "i");
  return tag(html, re1) ?? tag(html, re2);
}
function decodeEntities(s) {
  return s
    ? s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
       .replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&mdash;/g, "—")
    : s;
}

function evaluate(html) {
  const findings = [];
  const add = (level, id, msg) => findings.push({ level, id, msg }); // level: pass | warn | fail

  // Title
  const rawTitle = tag(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeEntities(rawTitle);
  if (!title) add("fail", "title", "no <title>");
  else if (title.length > TITLE_MAX) add("warn", "title", `<title> ${title.length} chars (> ${TITLE_MAX}; Google truncates ~${TITLE_MAX})`);
  else add("pass", "title", `<title> ${title.length} chars`);

  // Description
  const desc = decodeEntities(metaContent(html, "description"));
  if (!desc) add("fail", "description", "no <meta name=description>");
  else if (desc.length > DESC_MAX) add("fail", "description", `description ${desc.length} chars (> ${DESC_MAX})`);
  else if (desc.length > DESC_IDEAL) add("warn", "description", `description ${desc.length} chars (ideal <= ${DESC_IDEAL})`);
  else add("pass", "description", `description ${desc.length} chars`);

  // Canonical
  const canonical = linkHref(html, "canonical");
  if (!canonical) add("warn", "canonical", "no <link rel=canonical>");
  else add("pass", "canonical", `canonical ${/^https?:\/\//i.test(canonical) ? "absolute" : "relative: " + canonical}`);

  // Open Graph
  const ogTitle = metaContent(html, "og:title", "property") ?? metaContent(html, "og:title");
  const ogDesc = metaContent(html, "og:description", "property") ?? metaContent(html, "og:description");
  const ogImg = metaContent(html, "og:image", "property") ?? metaContent(html, "og:image");
  const ogMissing = [!ogTitle && "og:title", !ogDesc && "og:description", !ogImg && "og:image"].filter(Boolean);
  if (ogMissing.length) add("fail", "opengraph", `missing ${ogMissing.join(", ")}`);
  else add("pass", "opengraph", "og:title + og:description + og:image present");

  // OG image dims
  const ogW = metaContent(html, "og:image:width", "property") ?? metaContent(html, "og:image:width");
  const ogH = metaContent(html, "og:image:height", "property") ?? metaContent(html, "og:image:height");
  if (ogImg) {
    if (ogW && ogH) {
      if (+ogW === OG_W && +ogH === OG_H) add("pass", "og-dims", `og:image ${ogW}x${ogH}`);
      else add("warn", "og-dims", `og:image ${ogW}x${ogH} (recommended ${OG_W}x${OG_H})`);
    } else {
      // Next.js file-based opengraph-image sets dims on the generated tag; a URL-only og:image often omits them.
      add("warn", "og-dims", `og:image present but no explicit width/height (recommended ${OG_W}x${OG_H})`);
    }
  }

  // Twitter card
  const twCard = metaContent(html, "twitter:card");
  if (!twCard) add("warn", "twitter", "no twitter:card");
  else add("pass", "twitter", `twitter:card ${twCard}`);

  // JSON-LD
  const ldBlocks = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((m) => m[1]);
  if (!ldBlocks.length) add("warn", "jsonld", "no JSON-LD structured data");
  else {
    let bad = 0;
    for (const b of ldBlocks) { try { JSON.parse(b.trim()); } catch { bad++; } }
    if (bad) add("fail", "jsonld", `${bad}/${ldBlocks.length} JSON-LD block(s) do not parse`);
    else add("pass", "jsonld", `${ldBlocks.length} JSON-LD block(s), all parse`);
  }

  // Exactly one <h1>
  const h1s = (html.match(/<h1[\s>]/gi) || []).length;
  if (h1s === 0) add("fail", "one-h1", "no <h1>");
  else if (h1s > 1) add("warn", "one-h1", `${h1s} <h1> elements (want exactly 1)`);
  else add("pass", "one-h1", "exactly one <h1>");

  return findings;
}

const report = [];
let anyFail = false;
for (const t of targets) {
  try {
    const html = await loadHtml(t);
    const findings = evaluate(html);
    if (findings.some((f) => f.level === "fail")) anyFail = true;
    report.push({ target: t, findings });
  } catch (e) {
    anyFail = true;
    report.push({ target: t, error: e.message });
  }
}

if (asJson) {
  console.log(JSON.stringify({ lens: "seo-meta", strict, targets: report }, null, 2));
} else {
  const MARK = { pass: "PASS", warn: "warn", fail: "FAIL" };
  console.log("design-evaluate · scope-B SEO / share-meta lens (marketing surfaces only)");
  for (const r of report) {
    console.log(`\n  ${r.target}`);
    if (r.error) { console.log(`    ERROR: ${r.error}`); continue; }
    for (const f of r.findings) console.log(`    [${MARK[f.level]}] ${f.id}: ${f.msg}`);
  }
  const fails = report.flatMap((r) => (r.findings || []).filter((f) => f.level === "fail")).length;
  const warns = report.flatMap((r) => (r.findings || []).filter((f) => f.level === "warn")).length;
  console.log(`\n  RESULT: ${fails} FAIL / ${warns} warn across ${targets.length} target(s)${strict ? (anyFail ? " — STRICT: exit 1" : "") : " (advisory)"}`);
}

process.exit(strict && anyFail ? 1 : 0);
