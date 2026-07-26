# E3(saas) DIRECTIONS — three arms, written BEFORE any render exists (2026-07-26)

Stage 2 of the admitted loop. Per the sealed pre-registration: each arm
carries a one-sentence intent (frozen here) and, per the E1-precedent
Amendment A1 convention carried by the sealed brief ("intents + A1
declared-breaks blocks BEFORE renders"), a declared-breaks block — which
conventions the direction deliberately breaks and why the break serves its
thesis. The machine floor is never breakable; an undeclared break found in a
candidate scores as a mistake. No candidate code, render, score, or verdict
exists at the time of this commit. The three credibility strategies are
deliberately distinct: **demonstrate** (the artifact), **narrate** (the
sequence), **disclose** (the terms).

---

## Arm `worked-invoice`

**Intent (one sentence, frozen):**
"The pitch is typeset on the product's own paper: the page is one worked
Ledgerline invoice — features as line items, the real price as the total, the
trial as the payment terms — so you judge the tool by holding the thing it
makes for you."

**Declared breaks (A1):**
1. **The page is a document artifact, not a landing page** — one continuous
   invoice sheet replaces the hero + feature-sections scaffold entirely.
   Why it serves the thesis: an invoicing tool's most credible demonstration
   is a competent invoice; the page demonstrates the promise instead of
   asserting it (the rubric's named ideal form, chosen as this arm's thesis
   before any render existed).
2. **Persuasion is carried by document furniture only** — ruled lines,
   totals, a terms footer, and a single ink stamp; no badges, cards,
   gradients, or marketing chrome anywhere (CTA links styled as document
   actions remain real, unmistakable links). Why: a tradesperson trusts
   paperwork that looks like honest paperwork; chrome would read as software
   selling itself.

Planned layout class: single-document sheet. Palette world: invoice-paper
white / carbon ink / biro blue (the tradesman's pen, spent on actions) / one
stamp green (trial stamp + LIVE marks). Dark mode: carbon-copy night — dark
ground, carbon-paper text, same inks re-mixed. Motif budget: the ruled
line-item table, one stamp, a terms footer; no step numerals, no price-first
section, no two-column quote sheet.

---

## Arm `driveway-to-paid`

**Intent (one sentence, frozen):**
"Six plain steps from job done to money put aside: the page walks the
tradesperson's own afternoon — photo the job sheet, send from the van, paid
off a text — so the promise is read as a sequence you already live."

**Declared breaks (A1):**
1. **The opening viewport is step one of a story, not a value proposition** —
   "Job's done. Photo the job sheet." replaces the headline + subhead +
   product-shot hero. Why: the audience decides from recognition, not
   claims; the page opens inside the visitor's own working day and lets the
   sequence carry the pitch.
2. **Oversized step numerals are the primary graphic language** — display-
   scale 1–6 set in the accent ink, breaking the icon-tile feature-grid
   convention. Why: numbered steps are how trade method statements read;
   counting from job to paid IS the product's promise made visible.

Planned layout class: stepped-flow list (vertical, numbered). Palette world:
chalk white / deep workwear navy / hi-vis amber (spent on numerals and the
CTA) / one paid-green for the money steps. Dark mode: end-of-day navy ground,
chalk text, amber unchanged. Motif budget: the numbered step list, one accent
rule per step, a plain pricing section with the VAT note; no document
conceit, no stamps, no two-column quote sheet.

---

## Arm `fair-quote`

**Intent (one sentence, frozen):**
"The page is the quote a good tradesperson gives: the full price, the limits,
and the small print set large in the first screenful — because for someone
who distrusts subscriptions, the terms are the pitch."

**Declared breaks (A1):**
1. **Pricing is the first content section** — price, limits, VAT note, and
   trial terms appear before any feature is described, breaking the
   price-last SaaS convention. Why: the subscription-skeptic's first
   question is "what's this going to cost me"; answering it before selling
   anything is the credibility move (conversion-respecting, zero hype).
2. **The small print is set large** — the terms landing pages bury
   (VAT-exclusive note, invoice limits, the QuickBooks BETA status, support
   hours) are typeset at reading size with weight equal to the sell,
   breaking the fine-print convention. Why: surfacing the terms unprompted
   is how the page earns a distrustful visitor's trial click; every term is
   a sealed-data fact restated plainly.

Planned layout class: two-column quote sheet (quote table left/top, evidence
right/below; single column on mobile). Palette world: pale grey-slate ground /
near-black ink / brick red (spent on the quote rule-lines and CTA) / muted
slate for secondary text. Dark mode: dark slate ground, bone text, brick
warmed for AA. Motif budget: the quote table, the terms-at-reading-size
block, a compact evidence column; no stamps, no step numerals, no document-
invoice conceit.

---

## Shared discipline (all arms)

- Content: sealed `ledgerline.json` only; derived counts only via the
  committed injector's constants (`project/data/derived.json`). The GROUND
  content contract binds: every arm renders all 14 tagged blocks
  (`feat-invoice`, `feat-reminders`, `feat-markup`, `feat-taxpot`,
  `int-stripe`, `int-openbanking`, `int-quickbooks`, `tier-solo`,
  `tier-crew`, `pricing`, `trial`, `claim-pilot`, `claim-textlink`,
  `quote-okafor`) with exactly those `data-model` ids.
- Honesty traps, uniformly: the pilot claim renders ONLY with its basis
  ("internal estimate", "n=11 pilot users") visible in the same block; the
  anonymous unverified testimonial is omitted from every arm; QuickBooks
  renders the uppercase word **BETA** and is never grouped as shipped
  without it; the VAT note appears inside the `pricing` block and wherever
  any price is repeated; prices (`£9`, `£19`) appear only inside pricing
  blocks.
- Integration status renders as case-sensitive uppercase words **LIVE** /
  **BETA** (Gate A's verdict word binds to standalone `LIVE`; the word is
  reserved for shipped-integration status labels and appears nowhere else).
- Trial CTA: a real link, unmistakable, honest ("30 days free, no card
  required" — sealed wording), present at most twice (top region + pricing);
  no sticky bars, popups, exit intents, or urgency theater. Never nagging.
- Every arm embeds its own `#token-contract` (light+dark + gated pairs) and
  sets `data-arm="<arm-name>"` on `<html>` plus a `Ledgerline`-bearing
  `<title>` (page-identity assertion per L-081 happens before any
  measurement).
- Machine floor per GROUND.md; motion at most subtle and purposeful, with
  `prefers-reduced-motion` parity; no fingerprint-registry match, including
  the two design-level entries (no centered hero blob — the archetype's
  default shape — and no monotone metric grid).
- Divergence discipline (qualitative here; E2 measurement was E1-only): each
  arm keeps to its declared motif budget and avoids the other arms' motifs;
  palettes are three separated color worlds (warm paper/biro/stamp-green vs
  chalk/navy/hi-vis-amber vs grey-slate/ink/brick); layout classes
  single-document vs stepped-flow vs quote-sheet.
