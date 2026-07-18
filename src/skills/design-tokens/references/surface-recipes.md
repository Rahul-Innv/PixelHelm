# Surface-wiring recipes

Source: `design/tokens-and-aa-enforcement.md` + the `SURFACES` machinery in
`templates/tokens.test.template.mjs`. A "surface" is any file that renders or
mirrors token values. Surfaces that CAN import the ESM module should do that
directly; surfaces that can't MIRROR the names, and the lockstep test makes the
mirror honest.

**Contents:** [Picking a kind](#picking-a-kind) · [css-root](#css-root) ·
[js-map](#js-map) · [key-set](#key-set) · [Email](#email-surfaces) ·
[Per-role CSS-rule coverage](#per-role-css-rule-coverage) ·
[Parser assumptions](#parser-assumptions-fail-loudly-not-silently)

## Picking a kind

| Surface | Kind | What the test compares |
|---|---|---|
| Build-free HTML page | `css-root` | both `:root` blocks, every var name + value, vs the rebuilt expected map |
| Hardcoded JS/JSX object mirroring an export (e.g. icon glyphs) | `js-map` | keys AND values vs the token export |
| A file that ranks/lists the same roles (values unrelated), or any SCSS/CSS-in-JS the parsers can't read | `key-set` | key SET only — catches a role added/renamed in one place |
| Anything that can `import` the module | (no mirror) | nothing to drift — use the import |

## `css-root`

Mirror every token as a CSS custom property; naming is mechanical
(`--text-primary`, `--status-<slug>-bg`, `--space-md`, `--type-body`). The test
rebuilds the full expected map from the module via `expectedVars(mode)` and
`deepEqual`s both `:root` blocks — a missing, extra, or edited var fails.
Components then use ONLY `var(--…)`.

Register: `{ kind: 'css-root', file: '../../dashboard/index.html' }`.

Required page shape (the parser asserts it): exactly two `:root` blocks — the
first is light, the second sits inside `@media (prefers-color-scheme: dark)`.

## `js-map`

Keep the duplication, make it honest. The test parses a flat object literal
(`const NAME = { KEY: 'value', ... }`) and compares keys AND values to a token
export via `mirrorOf`.

Register: `{ kind: 'js-map', file: '../../dashboard/App.jsx', mapName: 'TIER_ICONS', mirrorOf: SEMANTIC_ICONS }`.

## `key-set`

The test compares key sets only (values free) — catches a role added or renamed in
one place. Use as the fallback for surfaces the parsers can't read (SCSS,
CSS-in-JS) when an import isn't possible.

Register: `{ kind: 'key-set', file: '../lib/email.mjs', objectName: 'STATUS_RANK' }`.

## Email surfaces

An email builder is server-side JS — it should **import the token module directly**
(no mirror needed) and get a `key-set` entry for its role-ranking object as the
drift guard. NEVER wire email as `css-root` — email has no `:root`, and many
clients strip `<style>`/`:root` entirely. (Route any actual email styling through
the `design-email` skill, which carries the Gmail/dark-mode client constraints.)

## Per-role CSS-rule coverage (optional)

From the source project: assert a `.badge--<slug>` / `.card--<slug>` rule exists
per role, so an unknown or NEW role degrades to a styled default instead of
unstyled garbage. Add this when the surface set has churning roles.

## Parser assumptions (fail loudly, not silently)

Read before wiring a surface:

- colors are 6-digit hex (or the literal `transparent` for chip backgrounds).
- `css-root` surfaces have exactly two `:root` blocks (light, then dark `@media`).
- `js-map` / `key-set` surfaces declare a FLAT object literal (no nested braces,
  single quotes).
- files with SCSS / CSS-in-JS / build pipelines: import the module directly, or
  fall back to a `key-set` check.
- `SURFACES` paths are relative to the TEST file's final location
  (`new URL(file, import.meta.url)`) — recompute the example paths for the real
  layout after copying.
