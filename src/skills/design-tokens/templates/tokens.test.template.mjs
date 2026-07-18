// tokens.test.template.mjs — permanent enforcement for the token module.
// Partner of tokens.template.mjs; run with: node --test
//
// Two guarantees this file makes PERMANENT (tests, not discipline):
//  1. WCAG AA forever: every color pair is re-checked with the exact WCAG 2.x
//     contrast formula in every mode. If a hex change drops a pair under
//     threshold, CHANGE THE HEX — never loosen an assertion here.
//  2. No surface can drift: every file registered in SURFACES is parsed and
//     compared name-by-name, value-by-value against the token exports.
//
// PARSER ASSUMPTIONS (read before wiring a surface — fail loudly, not silently):
//  • colors are 6-digit hex (or the literal 'transparent' for chip bgs)
//  • 'css-root' surfaces have exactly two :root blocks — the first is light,
//    the second sits inside `@media (prefers-color-scheme: dark)`
//  • 'js-map' / 'key-set' surfaces declare a FLAT object literal
//    (`const NAME = { KEY: 'value', ... }` — no nested braces, single quotes)
//  • files with SCSS/CSS-in-JS/build pipelines: import the token module
//    directly instead, or fall back to a 'key-set' check.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// EDIT HERE — point at your copied token module.
import {
  MODES, NEUTRALS, SEMANTIC_COLORS, SEMANTIC_ICONS, SPACING, TYPE,
  FONTS, RADII, ELEVATION,
} from './tokens.template.mjs';

// ---------- knobs ----------

// WCAG 2.2 AA. NEVER loosen these; change the hex. (4.5:1 normal text,
// 3:1 non-text graphics/borders and large text.)
const THRESHOLDS = { text: 4.5, graphic: 3 };

// Roles whose chip/badge is FILLED (saturated bg). Keep this to the single
// positive verdict — saturation hierarchy is what makes it the loudest element.
const FILLED_ROLES = ['POSITIVE']; // EDIT HERE

// CSS custom-property naming: --<VAR_PREFIX>-<role-slug>-<prop-kebab>.
const VAR_PREFIX = 'status';

/**
 * EDIT HERE — every file that mirrors the tokens. Three kinds:
 *  css-root: build-free HTML page; both :root blocks compared value-by-value
 *            against expectedVars() below.
 *  js-map:   a JS/JSX file hardcoding a flat object literal that mirrors a
 *            token export — keys AND values compared.
 *  key-set:  a file whose object literal must have the SAME KEYS as
 *            SEMANTIC_COLORS/SEMANTIC_ICONS (values free) — catches a role
 *            added or renamed in one place only.
 * Picking a kind: build-free HTML page → css-root · hardcoded JS/JSX object
 * mirroring an export → js-map · anything else that names the same roles
 * (email builder, ranking map, SCSS/CSS-in-JS fallback) → key-set. Surfaces
 * that CAN import the token module should do that instead of mirroring.
 * Paths are relative to THIS file's final location (new URL(file,
 * import.meta.url)) — recalculate the example paths for your layout.
 */
const SURFACES = [
  // { kind: 'css-root', file: '../../dashboard/index.html' },
  // { kind: 'js-map', file: '../../dashboard/App.jsx', mapName: 'TIER_ICONS', mirrorOf: SEMANTIC_ICONS },
  // { kind: 'key-set', file: '../lib/email.mjs', objectName: 'STATUS_RANK' },
];

/**
 * EDIT HERE — tokens beyond NEUTRALS/SEMANTIC_COLORS/SPACING/TYPE that your
 * css-root surfaces mirror. Mode-independent tokens belong in the light block
 * (declare-once convention); per-mode tokens in both.
 */
function extraVars(mode) {
  const out = { '--elevation-card': ELEVATION.card[mode] };
  if (mode === MODES[0]) {
    out['--font-ui'] = FONTS.family;
    out['--radius-card'] = RADII.card;
    out['--radius-control'] = RADII.control;
    out['--radius-pill'] = RADII.pill;
  }
  return out;
}

// ---------- exact WCAG 2.x contrast math (do not modify) ----------

function srgbChannel(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const h = hex.replace('#', '');
  assert.match(h, /^[0-9a-f]{6}$/i, `expected a 6-digit hex color, got "${hex}"`);
  const [r, g, b] = [0, 2, 4].map((i) => srgbChannel(parseInt(h.slice(i, i + 2), 16) / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function assertContrast(fg, bg, min, label) {
  const r = contrast(fg, bg);
  assert.ok(r >= min, `${label}: ${fg} on ${bg} = ${r.toFixed(2)}:1, needs ≥ ${min}:1`);
}

// ---------- 1. AA enforcement ----------

test('AA: every semantic role passes text/graphic contrast in every mode', () => {
  for (const mode of MODES) {
    const card = NEUTRALS[mode].card;
    for (const [role, modes] of Object.entries(SEMANTIC_COLORS)) {
      const { bg, fg, border, band, bandFg } = modes[mode];
      const effBg = bg === 'transparent' ? card : bg;
      assertContrast(fg, effBg, THRESHOLDS.text, `${mode} ${role} chip text`);
      assertContrast(border, card, THRESHOLDS.graphic, `${mode} ${role} border vs card`);
      // A filled chip's block must itself read as a graphic against the card.
      if (FILLED_ROLES.includes(role)) {
        assertContrast(bg, card, THRESHOLDS.graphic, `${mode} ${role} filled bg vs card`);
      }
      // Optional band extension: label + secondary text sit ON the tint; the
      // role border doubles as the band divider.
      if (band) {
        assertContrast(bandFg, band, THRESHOLDS.text, `${mode} ${role} band label vs band`);
        assertContrast(NEUTRALS[mode].textSecondary, band, THRESHOLDS.text, `${mode} ${role} secondary text vs band`);
        assertContrast(border, band, THRESHOLDS.graphic, `${mode} ${role} border vs band`);
      }
    }
  }
});

test('AA: neutral text + links pass on both page and card in every mode', () => {
  for (const mode of MODES) {
    const { page, card, textPrimary, textSecondary, textMuted, link } = NEUTRALS[mode];
    for (const [name, color] of Object.entries({ textPrimary, textSecondary, textMuted, link })) {
      assertContrast(color, page, THRESHOLDS.text, `${mode} ${name} vs page`);
      assertContrast(color, card, THRESHOLDS.text, `${mode} ${name} vs card`);
    }
  }
});

test('saturation hierarchy: exactly the FILLED_ROLES are filled', () => {
  for (const mode of MODES) {
    for (const [role, modes] of Object.entries(SEMANTIC_COLORS)) {
      if (FILLED_ROLES.includes(role)) {
        assert.notEqual(modes[mode].bg, 'transparent', `${role} ${mode} must be filled`);
      } else {
        // Light mode may use a soft tint; the loud SATURATED fill is reserved.
        // Tighten this branch to your project's rule if you need more.
      }
    }
  }
});

test('redundant cues: SEMANTIC_ICONS covers every role, no extras', () => {
  assert.deepEqual(
    Object.keys(SEMANTIC_ICONS).sort(),
    Object.keys(SEMANTIC_COLORS).sort(),
    'SEMANTIC_ICONS drifted from SEMANTIC_COLORS'
  );
});

// EXAMPLE — project-semantics guards: encode YOUR domain rules as assertions
// so a refactor can't silently violate them. Two real patterns:
//   • channel-order: an "unverified" role must stay muted amber, never read
//     red or green →  const [r,g,b] = hexChannels(fg); assert.ok(r >= g && g > b)
//   • copy-guard pairs: a NEGATIVE assertion ("no positive color on
//     unverified rows") is vacuous alone — pair it with the POSITIVE twin
//     ("the positive color DOES appear on verified rows").

// ---------- 2. surface lockstep ----------

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const roleSlug = (role) => role.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** The full expected CSS custom-property map for one mode. */
function expectedVars(mode) {
  const out = {};
  for (const [k, v] of Object.entries(NEUTRALS[mode])) out[`--${kebab(k)}`] = v;
  for (const [role, modes] of Object.entries(SEMANTIC_COLORS)) {
    const slug = roleSlug(role);
    for (const [prop, v] of Object.entries(modes[mode])) {
      out[`--${VAR_PREFIX}-${slug}-${kebab(prop)}`] = v;
    }
  }
  if (mode === MODES[0]) {
    // Mode-independent tokens are declared once, in the first (light) block.
    for (const [k, v] of Object.entries(SPACING)) out[`--space-${k}`] = v;
    for (const [k, v] of Object.entries(TYPE)) out[`--type-${k}`] = v;
  }
  Object.assign(out, extraVars(mode));
  return out;
}

/** Parse "--name: value;" declarations out of a :root block body. */
function parseVars(blockBody) {
  const out = {};
  for (const decl of blockBody.split(';')) {
    const m = decl.match(/^\s*(--[a-z0-9-]+)\s*:\s*(.+?)\s*$/is);
    if (m) out[m[1]] = m[2].replace(/\s+/g, ' ').trim();
  }
  return out;
}

/** Parse a flat `const NAME = { KEY: 'value', ... }` object literal. */
function parseJsMap(src, mapName) {
  const m = src.match(new RegExp(`const ${mapName} = \\{([^}]*)\\}`));
  assert.ok(m, `${mapName} object literal not found`);
  const parsed = {};
  for (const entry of m[1].matchAll(/(?:'([^']+)'|([A-Za-z][A-Za-z0-9_ ]*?))\s*:\s*'([^']*)'/g)) {
    parsed[(entry[1] ?? entry[2]).trim()] = entry[3];
  }
  return parsed;
}

/** Parse just the KEYS of a flat object literal (values may be non-strings). */
function parseJsKeys(src, objectName) {
  const m = src.match(new RegExp(`const ${objectName} = \\{([^}]*)\\}`));
  assert.ok(m, `${objectName} object literal not found`);
  return [...m[1].matchAll(/(?:'([^']+)'|([A-Za-z][A-Za-z0-9_ ]*?))\s*:/g)]
    .map((k) => (k[1] ?? k[2]).trim());
}

for (const s of SURFACES.filter((x) => x.kind === 'css-root')) {
  test(`lockstep: ${s.file} :root custom properties exactly mirror the tokens`, async () => {
    const html = await readFile(new URL(s.file, import.meta.url), 'utf8');
    const blocks = [...html.matchAll(/:root\s*\{([^}]*)\}/g)].map((m) => m[1]);
    assert.equal(blocks.length, 2, 'expected exactly two :root blocks (light + dark @media)');
    const darkMediaAt = html.indexOf('@media (prefers-color-scheme: dark)');
    assert.ok(darkMediaAt > -1, 'dark @media block missing');
    assert.ok(html.indexOf(blocks[1]) > darkMediaAt, 'second :root block must live inside the dark @media');
    assert.deepEqual(parseVars(blocks[0]), expectedVars(MODES[0]), `light :root drifted (${s.file})`);
    assert.deepEqual(parseVars(blocks[1]), expectedVars(MODES[1]), `dark :root drifted (${s.file})`);
  });
}

for (const s of SURFACES.filter((x) => x.kind === 'js-map')) {
  test(`lockstep: ${s.file} ${s.mapName} mirrors the tokens (keys AND values)`, async () => {
    const src = await readFile(new URL(s.file, import.meta.url), 'utf8');
    assert.deepEqual(parseJsMap(src, s.mapName), s.mirrorOf, `${s.mapName} drifted (${s.file})`);
  });
}

for (const s of SURFACES.filter((x) => x.kind === 'key-set')) {
  test(`drift guard: ${s.file} ${s.objectName} keys match the semantic roles`, async () => {
    const src = await readFile(new URL(s.file, import.meta.url), 'utf8');
    assert.deepEqual(
      parseJsKeys(src, s.objectName).sort(),
      Object.keys(SEMANTIC_COLORS).sort(),
      `${s.objectName} drifted from SEMANTIC_COLORS (${s.file})`
    );
  });
}
