# Honesty gates — derived-claims (Gate A) + content-manifest (Gate B)

Two machine-certain honesty gates for data-bearing UI, promoted from a battle-tested
project-local pair. They are **edition-agnostic honesty machinery** — they ship in both the
full and lite editions. Neither judges taste; each proves one narrow, fully-computable fact
about what the page *renders* in a real browser, in **both** color modes.

- **Gate A — `scripts/derived-claims-gate.mjs`**: no number on the page is invented, mis-attributed,
  or a false verdict.
- **Gate B — `scripts/content-manifest-gate.mjs`**: the page cannot pass Gate A by *deleting* the
  element that would have failed — every required item is still present, in both modes.

Both hard-gate (exit 1 on any violation, exit 0 clean, exit 2 on runner/config error). Layer-1
treats an exit-1 as a `[Blocker]` with confidence `machine-certain`, exactly like the contrast
gate. They render via the same real browser as `design-render` and read `innerText`/DOM, never
source — they check what actually ships, not what the source appears to say.

---

## Why these exist — the four failure classes

A data dashboard, price watcher, status board, or any UI that renders numbers from a data source
can lie in four distinct ways. Model judgment cannot reliably catch any of them; arithmetic can.

1. **Fabrication.** A number appears on the page that exists in **no** data source and in **no**
   injected constant — the model invented it (a hallucinated total, a made-up percentage, a
   guessed day count). Gate A, check (a).
2. **Derivation drift.** A number that *should* be a computed constant was instead re-derived by the
   model and rounded/fumbled. The proven catch: data carried `oldPrice: 2900.61`; the page rendered
   a hand-rounded **"$2,900"**. The correct injected display constant was `oldPriceRounded = 2901`.
   `2900` is in no data leaf and no constant → Gate A fabrication fires. (This is why the injector
   computes `Math.round` ONCE and injects `2901`; the model must print the constant, not round live.)
3. **Association.** A number that is real *somewhere* on the page appears inside the **wrong**
   block — block B's price shown under block A. Every figure is a legal data number, so fabrication
   is silent; only *scoped* association catches it. Gate A, check (b).
4. **False verdict.** The standalone verdict word (default `BUY`) appears un-negated inside a block
   whose status is not a buy — a **false BUY**. The proven catch: an uppercase CSS `text-transform`
   rendered the merchant **"Best Buy"** as a standalone **"BUY"** inside a non-buy model block during
   an arm build. The rendered `innerText` carried the transformed text, so the gate saw the real
   false verdict a source scan would have missed. Gate A, check (c). **A wrong price is a false BUY**
   — that is the whole reason the money gates and the verdict gate live together.
5. **Deletion.** The cheapest way to pass checks 1–4 is to *remove* the failing element. Gate B is
   the floor against that: every declared required item must still be present, in both modes.

---

## The injector pattern (never model-authored arithmetic)

The gate's allow-list is only as honest as its inputs. The proven pipeline is:

```
data/*.json  (truth: literal fields — afterTax, lowestKnown, daysUntil, offers[].discount, …)
      │
      ▼  a build-time injector script (pure arithmetic on literals ONLY; never reads the clock)
data/derived.json  (injected constants: per-block money sets, global allow-list, page claims,
      │             and numericTokens = every number that legitimately appears in a data leaf)
      ▼
the page prints CONSTANTS   ──rendered──►   derived-claims-gate.mjs re-diffs the render vs the truth
```

Rules the injector obeys, and the gate assumes:

- **Literal-field-first.** Prefer the field the JSON already carries. Compute only pure arithmetic
  on those literals (`overage = afterTax - budgetCap`, `oldPriceRounded = round(oldPrice)`, counts,
  cheapest). No model — weak or strong — ever does this arithmetic; it is done once and injected.
- **Never clock-derived.** A day count (`daysUntil`) is a JSON literal, never `new Date()`. A gate
  that read the clock would be non-reproducible and could pass a stale page. Neither the injector
  nor the gate imports a date.
- **URL leaves excluded.** Numbers inside `*url`/`sourceUrl`/`searchUrl` string fields (tracking ids,
  skus) are NOT harvested into the allow-list — otherwise an arbitrary `item=9SIA…` id would launder
  any invented number.

A project without an injector can point the gate straight at its data files (see `perBlockMoneyScopes`
with `moneyFields` below), but the injector pattern is strongly preferred: it moves the arithmetic
out of the model's reach and gives the gate a single, auditable source of constants.

---

## Gate A config schema (`--config <project-claims.json>`)

```
node derived-claims-gate.mjs --config <project-claims.json> [--target <html>] [--json]
```

```jsonc
{
  "root": ".",                       // base for resolving relative paths (default: the config file's dir)
  "target": "index.html",            // default target; --target overrides
  "dataFiles": ["data/data.json"],   // JSON truth sources — every numeric leaf is an allowed number
  "derivedFile": "data/derived.json",// optional injected-constants file — its numbers are allowed too
  "extractNumbersFromStrings": true, // default true: harvest numbers embedded in data STRINGS
                                     //   ("RTX 5060, 32GB" -> 5060, 32), url-bearing fields excluded
  "globalAllow": [1900, 2387, 487],  // numbers legal ANYWHERE (also pulled from derived via a path below)
  "modelBlockAttr": "data-model",    // the attribute that tags a scoped block (default "data-model")

  "perBlockMoneyScopes": {           // how each block's allowed MONEY set is derived (association scope)
    "modelsPath": "models",          //   dotted path to the per-block collection (in derivedFile if present,
                                     //   else the data). Object keyed by block-key OR an array.
    "keyField": "key",               //   array only: the field giving the block key (== the attr value)
    "moneySetField": "moneySet",     //   PREFERRED: a precomputed array of allowed money numbers per block
    "moneyFields": ["current","afterTax","target","lowestKnown","oldPrice"], // FALLBACK: collect these scalars
    "moneyArrayFields": [            //   FALLBACK: nested arrays of money-bearing rows
      { "at": "history", "fields": "v" },
      { "at": "offers",  "fields": ["price","oldPrice","afterTax","total"] }
    ],
    "globalAllowPath": "globalMoneyAllow" // optional: pull the global money allow-list out of derivedFile
  },

  "verdict": {                       // the false-verdict check
    "word": "BUY",                   //   standalone verdict word (case-sensitive), default "BUY"
    "negationWindow": 30,            //   chars BEFORE the word searched for a negator, default 30
    "negators": ["never","not","false","no"],
    "statusField": "status",         //   per-block status field
    "positiveStatus": "BUY",         //   blocks with THIS status may carry the word un-negated
    "provisional": {                 //   optional: a provisional block must carry a marker AND a
      "status": "PROVISIONAL",       //   never/not-a-verdict phrase (else CRITICAL)
      "markerPattern": "provisional|unverified|estimate|≈",
      "negationPattern": "never a buy|not a buy|false buy|no buy"
    }
  },

  "numericContexts": { "money": true, "percent": true, "count": true, "days": true },
  "extraNumericContexts": [          // add domain claim kinds; the captured number is allow-checked
    { "kind": "ghz", "pattern": "(\\d+(?:\\.\\d+)?)\\s?GHz", "group": 1 }
  ],

  "themeKey": "app-theme",           // optional localStorage key the app reads for its theme
  "darkAttr": "data-theme",          // optional <html> attribute set per mode
  "modes": ["dark","light"],         // color modes to render + diff (default both)
  "browserChannel": "msedge"         // optional; the fallback chain still applies
}
```

`verdictWord` and `negationWindow` may also be set at the top level (`"verdictWord": "SELL"`,
`"negationWindow": 40`) for domains where the verdict is not a purchase.

### The `perBlockMoneyScopes` convention (association scoping)

For each block key found in the DOM under `[modelBlockAttr]`, the gate builds an **allowed money
set** = the global money allow-list **∪** that block's own money set. A `$` figure inside the block
whose value is not in that set is an association violation. The block's own money set is resolved in
this order: `moneySetField` (a precomputed array — the injector's `moneySet`) first, then additively
`moneyFields` (scalar fields on the block object) and `moneyArrayFields` (nested money-bearing rows).
Values are compared with two-decimal tolerance (`2387` == `2387.00`), so formatting variants
(`$2,387`, `2387.00`) match one canonical figure.

---

## Gate B manifest schema (`--manifest <manifest.json> --target <html>`)

```
node content-manifest-gate.mjs --manifest <manifest.json> --target <html> [--json]
```

```jsonc
{
  "meta": {                          // machine config (human docs may live under "_meta")
    "themeKey": "app-theme",         //   optional localStorage theme key
    "darkAttr": "data-theme",        //   optional <html> attribute set per mode
    "modelBlockAttr": "data-model",  //   attribute that tags a scoped block (default "data-model")
    "modes": ["dark","light"]        //   modes each item must be present in (default both)
  },
  "required": [
    { "id":"budget",  "description":"The all-in budget cap is stated", "scope":"global",
      "type":"text", "match":"\\$?\\s?1,900\\b" },
    { "id":"price-a", "description":"Block a shows its own after-tax price", "scope":"model:block-a",
      "type":"text", "match":"\\$?\\s?2,?387\\b" },
    { "id":"verdict-count", "description":"honest verdict count", "scope":"global", "type":"text",
      "match":["0 of 5","none of the five"] },              // array = literal alternatives
    { "id":"cta", "description":"repo CTA link present", "scope":"global",
      "type":"href", "match":"gitlab.com" },                // substring an <a href> must contain
    { "id":"block-tags", "description":"every block is tagged (anti-deletion anchor)", "scope":"global",
      "type":"dataModel", "match":["block-a","block-b","block-c"] } // each key needs >=1 DOM element
  ]
}
```

- **scope**: `global` = the whole page `innerText`; `model:<key>` = concatenated `innerText` of every
  `[modelBlockAttr="<key>"]` block.
- **type**: `text` (case-insensitive regex source, or an array of literal alternatives; honors
  `minCount` for "at least N times"), `href` (substring at least one `<a href>` must contain),
  `dataModel` (each block key must have ≥ 1 element in the DOM — the anti-deletion anchor).

Include, at minimum: every model display name, each priced block's own figure inside its own block,
each no-price block's honest no-price phrase, any provisional marker + never-a-verdict phrase, the
headline claim, the honest verdict count, and one `dataModel` item listing every block key.

---

## Rendering (both modes)

Both gates render the target in a real browser (Playwright, channel fallback: configured → system
Edge → system Chrome → bundled Chromium), `reducedMotion: "reduce"`, at 1440×900, and diff **both**
color modes because arms flip themes two ways: they set `colorScheme` (the media mechanism) AND, when
configured, write `themeKey` to `localStorage` and/or set `darkAttr` on `<html>`. A finding that
reproduces in both modes is reported once, listing both modes. Rendering `innerText` (not source) is
deliberate — it is how the CSS-transform "Best Buy → BUY" and the runtime-injected values are caught.

### Standalone Playwright resolution

Both scripts run standalone with `node`. Playwright is resolved via a multi-path `createRequire`
fallback so no absolute user path is ever embedded (that would also trip the build's path-escape
lint): `PLAYWRIGHT_PKG` env override → the sibling `design-render` skill's `package.json` (which
vendors Playwright per plugin version) → plain resolution. Install once per plugin version with
`npm i` in the `design-render` skill dir, or point `PLAYWRIGHT_PKG` at any `package.json` that can
resolve `playwright`.

---

## The non-vacuity mutant ritual (a gate that cannot fire is rejected)

A green gate is worthless until you have watched it go red. **Before trusting either gate on a
project, run the mutant ritual — one deliberate lie per failure class — and confirm each fires,
then confirm the unmutated page is clean.** A gate that stays green on a planted lie is broken (a
bad selector, a mis-scoped block, a dead regex) and must be fixed before it is relied on.

The minimal mutant set (proven 4/4 on the reference project):

| Mutant | Plant | Must fire |
| --- | --- | --- |
| Fabrication | inject a `$99,999` total in the body | Gate A · FABRICATION |
| Association | put a real *other* block's `$` figure inside block A | Gate A · ASSOCIATION |
| False verdict | inject a standalone un-negated `BUY` in a non-buy block | Gate A · VERDICT |
| Deletion | remove a required element (a CTA href, a name) | Gate B · MISSING |

Keep the mutants as throwaway copies outside the repo; never commit a mutated page.

---

## Dogfood record (the promoted implementation's live history)

The generalized gates here are a config-driven port of a pair that ran live on a real bold-design
project. Their record before promotion:

- **Non-vacuity: 4/4 mutants fired + clean green.** Every planted lie above went red; the shipped
  page passed clean.
- **Caught a real hand-rounded `$2,900`** on the shipped page: data `2900.61`, page rendered a live
  rounded `2900`, correct injected display constant `2901`. Derivation drift, caught as fabrication.
- **Caught an uppercase CSS transform** rendering merchant "Best Buy" as a standalone `BUY` inside a
  non-buy model block during an arm build — a false verdict a source scan would have missed.
- **A foreign-family builder (Codex) passed first-try** under the injector kill-switch: because the
  arithmetic was injected, not model-authored, an unrelated builder produced an honest page on the
  first attempt.
- **Zero confirmed false positives** across 6 bold competing designs and 4 winner iterations.

This is the precision half of the lifecycle rule below.

---

## Gate lifecycle rule (why this promotion order matters)

**Project-local dogfood on live bold work comes BEFORE shared-infra promotion.** Two different
proofs are required, and they are not interchangeable:

- **Retro-corpus proves recall.** Running a new gate over a corpus of known-bad pages shows it
  *catches* the failure classes it claims to.
- **Live-dogfood proves precision.** Running it as a real ship gate on genuinely bold, varied design
  work — where false positives would block good pages — is the only thing that proves it does not
  cry wolf. Six competing designs and four winner iterations with zero false positives is precision
  evidence a retro corpus cannot supply.

A gate earns promotion into shared infrastructure only after it has both: recall on a corpus AND
precision on live bold work. These two gates cleared that bar on the reference project, which is why
they are here — generalized, config-driven, and still carrying the mutant ritual as their entry test
on every new project.

---

## Retro-corpus record (2026-07-11)

Recall evidence gathered by running the promoted gate over a corpus of known-bad and known-good pages,
plus precision findings surfaced while doing so. Recorded here so the promotion's evidence trail lives
next to the gates it is evidence for.

### Recall proven

- **Patience Desk replay.** The promoted gate independently re-caught the historical hand-rounded
  `"was $2,900"` defect (see "Derivation drift" above) — both **FABRICATION** and **ASSOCIATION** fired
  on the replayed page.
- **L-004 ancestry.** The gate FIRED on the original surviving Stitch mockup (`Startup Momentum
  Analysis/archive/old-design-system/stitch-output/lumora-company-desktop.html`) on `"$3.2M led by
  [CONFIDENTIAL]"` and `"updated 3 days ago"` — the exact fabrication class L-004 documents (see
  `src/seeds/LESSONS-seed.md`).
- **Laptop dashboard mutants.** Both a planted rounding mutant (`Math.floor` display of `2900.61`) and
  a planted honest-verdict-deletion mutant were caught, consistent with the non-vacuity ritual above.

### Recall boundary (documented honestly)

The historical email-digest defect — green BUY-role styling applied to WATCH rows — does **not** fire
this gate. Role/color misuse with otherwise-correct numbers is a token/role-gate class, not a claims
class (see the incumbent-honesty-audit lesson). This is an explicit non-goal of Gate A/Gate B: they
prove numbers and verdict words are honest, not that a role's color is honest.

### Precision findings

- **Runtime-derived values need config discipline.** A value computed at render time from other
  literals (e.g. a buy-below sticker derived from `budgetCap` / `taxRate`) false-fires under a naive
  `dataFiles`-only config, because the computed figure exists in no data leaf. This is not a gate bug —
  it is the gate **enforcing the injector pattern**: any legitimate derivation must be registered in
  `derivedFile` (or `globalAllow`), or the gate correctly treats it as an invention. Documented as
  intended behavior that requires config discipline, not a false positive to suppress.
- **Unscoped pages silently no-op scoped checks.** On pages with no `modelBlockAttr`-tagged blocks,
  the ASSOCIATION and VERDICT checks scope zero blocks and pass trivially (0 blocks scoped) — a green
  result on such a page proves only that FABRICATION was checked, not association or verdict honesty.

### Reviewer TODOs (not implemented unattended — for the owner's branch review)

1. **Warn loudly on zero-block scoping.** When `modelBlockAttr` matches zero blocks, emit a visible
   warning (optionally non-zero-exit) so degraded ASSOCIATION/VERDICT coverage is never silent.
2. **`MONEY_RE` doesn't consume M/K multipliers.** `"$3.2M"` parses as `3.2` — the gate still fires
   correctly on this pattern, but the reported figure is the bare mantissa, not the multiplied value.
   Worth tightening so the reported number matches what a human reads.
3. **A follow-on role-misuse gate would close the email-digest recall boundary above** — checking for
   verdict-colored roles (e.g. BUY-green) applied to non-verdict rows, as a companion to Gate A/Gate B
   rather than a change to either.
