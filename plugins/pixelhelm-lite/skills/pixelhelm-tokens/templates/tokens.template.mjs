// tokens.template.mjs — single source of truth for every design value (color,
// type, spacing) across EVERY surface of a product (app UI, email, docs page…).
//
// HOW TO USE (the pattern, not just the file):
//   1. Copy this file into the project (e.g. lib/tokens.mjs) and its partner
//      tokens.test.template.mjs (e.g. test/tokens.test.mjs); fix the import
//      path at the top of the test.
//   2. Replace every block marked EXAMPLE with the project's own values.
//      The shipped EXAMPLE hex come from a real project and pass WCAG AA, so
//      the pair runs green out of the box — they are NOT a recommended palette.
//   3. Register each downstream surface in the test's SURFACES list.
//   4. Run `node --test`. If a contrast assertion fails: CHANGE THE HEX, never
//      the threshold. Compute a passing hex; never eyeball one.
//   5. Non-vacuity ritual (MUST, once per wiring): break one hex on purpose,
//      confirm the test FAILS with a contrast message, restore it.
//
// Surfaces that cannot import ESM (a build-free HTML page, a template engine)
// MIRROR these names. The partner test makes the mirror mechanical: it parses
// those files and fails on any name/value drift, so the duplication is honest.

/** Every color export below must define all of these modes. */
export const MODES = ['light', 'dark'];

/**
 * Surface + text colors per mode. `page` = body background, `card` = the
 * surface components sit on (contrast is measured against `card`).
 * Dark `card` uses SURFACE ADVANCEMENT (~+5% lightness vs page) instead of
 * shadows — shadows are invisible on dark backgrounds.
 */
export const NEUTRALS = {
  // EXAMPLE — replace with your project's values, then re-run the test.
  light: {
    page: '#f7f7f8', card: '#ffffff', border: '#e7e8ea',
    textPrimary: '#1f2937', textSecondary: '#4b5563', textMuted: '#646d7e',
    link: '#1d4ed8',
  },
  dark: {
    page: '#0f1115', card: '#1a1e27', border: '#2a2f3a',
    textPrimary: '#e5e7eb', textSecondary: '#b3bac4', textMuted: '#9ca3af',
    link: '#7eb3f7',
  },
};

/**
 * Semantic role colors — name them by MEANING (verdict/confidence/state), never
 * by hue. Each role is { light:{bg,fg,border}, dark:{bg,fg,border} };
 * `bg:'transparent'` = outline-only chip, contrast measured against the card.
 * Add extra per-role props freely (e.g. `band`, `bandFg` for a tinted header
 * strip) — the partner test auto-expands every prop into the CSS-var lockstep.
 *
 * Reserve the single FILLED, saturated role for the one positive verdict
 * (see FILLED_ROLES in the partner test); pair any "unverified/estimate" role
 * with a DASHED border so the tier reads without color (WCAG 1.4.1: icon +
 * label + shape, never color alone).
 */
export const SEMANTIC_COLORS = {
  // EXAMPLE roles — replace names AND values with your project's semantics.
  POSITIVE: { // the one filled role: saturated bg + white/near-black fg
    light: { bg: '#15803d', fg: '#ffffff', border: '#15803d' },
    dark: { bg: '#4ade80', fg: '#052e16', border: '#4ade80' },
  },
  CAUTION: {
    light: { bg: '#fef3c7', fg: '#92400e', border: '#b45309' },
    dark: { bg: 'transparent', fg: '#fbbf24', border: '#b45309' },
  },
  NEUTRAL: {
    light: { bg: '#f3f4f6', fg: '#4b5563', border: '#6b7280' },
    dark: { bg: 'transparent', fg: '#9ca3af', border: '#6b7280' },
  },
  UNVERIFIED: { // muted (desaturated), pairs with a dashed border everywhere
    light: { bg: '#f8f4e9', fg: '#7a6520', border: '#95803f' },
    dark: { bg: 'transparent', fg: '#d6bb6d', border: '#8a7637' },
  },
};

/**
 * Per-role icon glyphs — the "icon" leg of icon + label + shape redundancy.
 * Keys MUST stay identical to SEMANTIC_COLORS (the partner test enforces it).
 */
export const SEMANTIC_ICONS = {
  // EXAMPLE — one glyph per role above.
  POSITIVE: '✓',
  CAUTION: '?',
  NEUTRAL: '—',
  UNVERIFIED: '≈',
};

/**
 * Typography. For data UIs prefer a variable font with TABULAR NUMERALS and a
 * metric-matched fallback; email surfaces never use the webfont (clients
 * ignore it) — system stack only there.
 */
export const FONTS = {
  // EXAMPLE — replace family/CDN with your project's choice (or system-only).
  family: "'Inter', 'Inter Fallback', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
  cdnWoff2: 'https://cdn.jsdelivr.net/npm/@fontsource-variable/inter@5.2.5/files/inter-latin-wght-normal.woff2',
  numerals: 'tabular-nums',
};

/** Radius scale: subtle for surfaces, pill for chips. 12px+ reads soft. */
export const RADII = { card: '10px', control: '8px', pill: '999px' };

/**
 * Elevation: light mode = layered 2-shadow (fine + coarse) + 1px border for
 * figure/ground; dark mode = NO shadow (invisible) — surface advancement in
 * NEUTRALS.dark.card does the lifting.
 */
export const ELEVATION = {
  card: { light: '0 1px 1px rgba(0,0,0,.03), 0 3px 6px rgba(18,42,66,.04)', dark: 'none' },
};

/** Spacing scale (4/8px grid). Nesting rhythm: 16 card padding → 8 section gap → 4 element gap. */
export const SPACING = { xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px' };

/**
 * Fluid type scale via clamp() — one ratio system-wide (1.125 for dense UI;
 * 1.2+ is editorial). `display` is the single hero size per card/section.
 */
export const TYPE = {
  // EXAMPLE — 14px body anchor × ~1.125 ratio.
  micro: '0.6875rem',
  caption: 'clamp(0.75rem, 0.74rem + 0.08vw, 0.8125rem)',
  body: 'clamp(0.875rem, 0.86rem + 0.1vw, 0.9375rem)',
  h3: 'clamp(0.9375rem, 0.9rem + 0.2vw, 1rem)',
  h2: 'clamp(1rem, 0.95rem + 0.3vw, 1.125rem)',
  h1: 'clamp(1.125rem, 1.05rem + 0.5vw, 1.25rem)',
  display: 'clamp(1.5rem, 1.4rem + 0.6vw, 1.75rem)',
};
