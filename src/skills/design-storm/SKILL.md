---
name: design-storm
description: >-
  Produces a VERIFIED, cited DESIGN BRIEF for a subject via a perspective-guided,
  source-grounded, claim-verified research engine (STORM): grounded design
  recommendations per dimension (accessibility, visual/brand, IA, conversion/UX,
  responsive, performance) each with a confidence, a gate verdict, and honest
  abstains — NOT UI. Use when a redesign or new build warrants RIGOROUS grounding
  before taste or code: "ground this deeply", "give me a research-backed / evidenced
  brief", "what does the evidence actually say about this screen", "build the
  grounded design brief", or when design-ground escalates Gate #0 to deep grounding.
  It is the deep-research arm of the grounding layer — design-generate/design-direction
  turn its brief into pixels, design-council judges against it. NOT a generator (emits
  a brief, not UI), NOT for quick passes (it runs many paid model calls over minutes).
shell: bash
---

# design-storm — the verified design-brief engine

!`node "${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs" design-storm 2>/dev/null`

STORM is a portable, **perspective-guided, source-grounded, claim-verified** research engine. Given a
subject (a screen / flow / page under redesign) it runs non-overlapping analyst personas that interrogate
it, an expert answers **grounded only in fetched local sources** (the design KB, WCAG, the project's
design-system docs, north-star notes), every load-bearing inference is surfaced as a typed claim, each
claim is **verified at the claim level**, and it emits a **verified multi-section brief** that abstains
honestly when the evidence is thin.

**It emits a BRIEF, not UI.** The brief's cited recommendations become the grounded input to
`design-direction`/`design-generate`; `design-council`'s Register-fit lens judges directions against it.
If you expected STORM to emit pixels, it is the wrong layer.

This is a **subjective/research skill** wrapping an **objective** verification gate — the recommendations
are qualitative, but which ones *survive* is decided by a deterministic entailment + self-consistency +
contestation gate, not by vibes.

## When to run it (situational — NOT every pass)

Run design-storm when the payoff justifies the cost:
- a **real redesign** of a surface that matters (the tournament will BEAT an incumbent — ground it first);
- the owner asks for an **evidenced / research-backed** brief, or wants to know "what the canon says";
- Gate #0 (`design-ground`) escalates to deep grounding on a high-stakes surface.

Do NOT run it for a quick fix, a token tweak, a copy edit, or any pass where by-hand grounding from the
profile + lessons already suffices. It makes many model calls (≈8 perspectives × K runs), so it is minutes
and real tokens, not seconds.

## Where it lives + how to run it

The engine + adapter ship INSIDE this skill:

```
${CLAUDE_PLUGIN_ROOT}/skills/design-storm/storm/
  storm_engine/      # the portable engine, COPIED VERBATIM — DO NOT MODIFY (a mirror of its upstream; raise engine issues upstream, never fork here)
  design_adapter/    # the design adapter (framework / retrieval / gate / roles / llm / provider)
  run_live.py        # the bounded live runner (auth probe -> brief() -> archive JSON)
  demo_offline.py / demo_live_shape.py   # offline proofs (no network) — run these to sanity-check the pipeline
```

Requires python 3.12+ and `pip install anthropic` (live runs only; the offline proofs are stdlib-clean).

**Offline sanity check (no API):** `cd "${CLAUDE_PLUGIN_ROOT}/skills/design-storm/storm" && python demo_offline.py` (exits 0 on PASS).

**Live brief (paid):** `cd "${CLAUDE_PLUGIN_ROOT}/skills/design-storm/storm" && python run_live.py` — it (1) probes auth cheaply, then (2) drives
`DesignLLM("sonnet")` roles + `DesignLLM("opus")` judge over `DesignRetrieval.default_design_kb(extra=[…])`
through `StormDesignProvider(strict_drop=False)` and (3) archives the brief + cost ledger to
`storm/live-brief-<subject>.json`. Edit the `subject` dict + corpus `extra` in `run_live.py` for a new
surface, or import the adapter and call `prov.brief(subject)` yourself (recipe in `storm/README.md`).

- **Auth:** a bare `anthropic.Anthropic()` resolves an `ant auth login` OAuth profile when no
  `ANTHROPIC_API_KEY` shadows it; OAuth on `/v1/messages` may need the `anthropic-beta: oauth-2025-04-20`
  header (run_live.py falls back to it). If the profile's refresh token has expired, re-run `ant auth
  login` or set a funded `ANTHROPIC_API_KEY`. See `references/running.md`.
- **Flag-only, always (until earned).** `strict_drop=False` — the judge's precision gate was never cleared
  on a hand-rated design gold set, so nothing unsupported is silently deleted; it is FLAGGED instead.

## The brief shape (what you consume)

`brief()` returns `{subject, framework_id, flag_only, sections[], abstained[], evasions[]}`. Each section:

```
{ lens, status, headline, recommendations[], risks[], citations[], confidence, contested, contesting_claims }
    status         "filled" (a supported constructive finding survived) | "insufficient_evidence" (ABSTAIN)
    recommendations [{ text, kind, verdict, confidence, flagged }]   flagged=true => retained but unsupported
    risks          the refuter's SUPPORTED bear-case findings for this lens (usability/a11y failures)
    citations      [{ claim, url, title }] — the cited local principle/reference/standard
    confidence     0..1, floored to 0.1 when the lens is `contested` by a supported refuter claim
```

## How to CONSUME the brief (the load-bearing contract)

**This is where the brief either strengthens the loop or silently reintroduces the L-012 regression. Follow
`references/consuming-the-brief.md` exactly.** The short version:

- A **supported constructive recommendation** = a **CONSTRAINT** every candidate must satisfy (same status
  as a diagnosis finding) — it is NOT scored taste and never buys a win over the register.
- A **refuter `risk`** (supported disconfirming) = a **HARD constraint** — a real usability/a11y failure to
  fix; a `contested` lens's floor-0.1 confidence flags it.
- A **`flagged` recommendation** (verdict ≠ supported, retained under flag-only) = **advisory only, LOW
  trust** — never promote it to a constraint; it is an unverified leap the gate could not ground.
- An **abstained lens** (`insufficient_evidence`) = **no evidence → no weight** (silence ≠ absence). Do not
  read an abstain as "this dimension is fine" or as license to invent.
- **Register-fit stays the chair-weighted GATE.** STORM's `visual_brand` cited findings may GROUND a
  register-fit critique (cite the principle instead of vibing), but they do NOT override the gate and NEVER
  let a discipline/diagnosis finding out-rank the profile `_register`. Declutter/recede/flatten findings
  are constraints, not a mandate to strip the register's warmth.

## Where this sits in the plugin

- **`design-ground` (Gate #0) invokes this** on a deep-grounding escalation and folds the verified brief
  into the resolved ground context (a `stormBrief` field). Grounding still runs even if design-storm is
  skipped — this is the *rigorous* branch, not the default.
- **`design-direction` / `design-generate` consume the brief** as grounded input (constraints per the
  contract above), alongside the token contract + profile register.
- **`design-council` judges against it** — the Register-fit and Craft lenses cite the brief's supported
  findings; abstains/flags carry no evidentiary weight.

## Coordination / ownership (do NOT fork)

The **engine (`storm_engine/`) is owned by the engine's upstream project** and copied
here verbatim. Do not modify or fork it — raise engine bugs / contract changes back there (open items are
tracked in `STORM-Engine-Coordination-FROM-DesignAdapter-2026-07-01.md` at that project's root, and in the
design-KB `STORM-INTEGRATION-BACKLOG.md` §5b). `design_adapter/provider.py` is engine-generic (a
promote-to-engine candidate). Only the adapter is design-owned and safe to edit here.

## Anti-patterns

- Treating the brief as UI, or as a spec that replaces the tournament. It grounds taste; it does not
  generate it.
- Promoting a `flagged` (unsupported) recommendation to a constraint, or reading an `abstain` as approval.
- Letting a STORM discipline finding out-vote the register-fit gate (the L-012 regression).
- Editing `storm_engine/`. Running it for a trivial pass. Assuming `strict_drop` before it is earned.

## References

- `references/consuming-the-brief.md` — the full constraint contract + the L-012 invariant (READ before wiring a brief in).
- `references/running.md` — auth, cost bounding (k_runs/max_turns), the corpus, and re-targeting a new subject.
- `${CLAUDE_PLUGIN_ROOT}/skills/design-storm/storm/README.md` — the adapter API + live-run recipe.
- (The STORM evolution/integration backlog lives in the owner's dev workspace, not in the shipped plugin.)
