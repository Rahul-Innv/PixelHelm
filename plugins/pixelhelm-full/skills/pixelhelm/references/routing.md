# Routing — intents, triggers, gate sequences, registry map

Table of contents:
1. Intent classification table (trigger -> intent)
2. The sub-skill registry map (id -> skill-type -> when)
3. Per-intent gate sequences (the full loop per intent)
4. Disambiguation rules (when two intents fit)
5. Near-miss exclusions (what NOT to route to the design router)

This is the authoritative routing reference for the `pixelhelm` router. It does not
re-implement any sub-skill; it says which one to dispatch and in what order.

---

## 1. Intent classification table

Map the request to ONE primary intent. Phrasings are illustrative, not exhaustive —
route on meaning, and lean pushy (route to design on any UI/visual/design-quality ask,
even when the user does not name a sub-skill).

| Intent | The user wants... | Trigger phrasings |
|---|---|---|
| NEW DESIGN | a UI surface that does not exist yet | "build a / design a [screen/page/dashboard/landing/component]", "I need a UI for X", "create the onboarding flow", "design from scratch" |
| REDESIGN | an existing surface made better | "redesign this", "make this look better/premium/less generic", "visual overhaul", "this screen feels off", "level up the UI", "modernize" |
| REVIEW / EVAL | a graded audit, no changes | "design review", "audit my UI", "critique this", "check contrast/AA/accessibility", "is this any good", "grade this screen", "what's wrong with this design" |
| FIX | specific findings cleared | "fix the spacing/hierarchy/states", "the focus ring is missing", "clear these findings", "apply the review", "fix the dark-mode contrast" |
| TOKENS | the token/brand contract itself | "set up tokens", "the design system", "brand tokens", "token contract", "design.md / DTCG", "our palette/scale as tokens" |
| COLOR | palette / contrast work | "color palette", "pick brand colors", "fix contrast by construction", "the teal scale", "AA-safe colors", "dark-mode colors" |
| TYPOGRAPHY | type-system work | "fonts", "type scale", "font pairing", "fluid type", "line-height/measure", "tabular numbers", "font CLS / layout shift" |
| MOTION | animation / interaction craft | "animation", "motion", "transitions", "micro-interactions", "reduced-motion", "easing", "make it feel alive" |
| EMAIL | an HTML email surface | "email design", "newsletter", "transactional email", "make the email render in Gmail", "email template" |
| DIRECTION | options before committing | "give me a few directions", "design options", "mockup some looks", "show me 2-3 takes before you build", "I don't know what I want yet" |
| DATAVIZ | chart / dense-data craft | "design this chart/gauge/sparkline", "the dashboard data viz", "show uncertainty honestly", "make the table scannable" |
| CONTENT | the words on a surface | "the microcopy", "empty-state text", "error messages", "label these controls", "UX writing pass" |
| VIDEO | a video/avatar surface | "explainer video", "avatar", "HeyGen/Remotion", "video on the landing page" |
| LEARN | wrap-up / lesson capture | "what did we learn", "update the lessons", "refresh the design rules", "capture this as a rule", "the anti-slop list is stale" |

---

## 2. The sub-skill registry map

Read `${CLAUDE_PLUGIN_ROOT}/skills.json` for the authoritative typed registry. The
working map (id -> skill-type -> when the router dispatches it):

| id | skill-type | Router dispatches it when... |
|---|---|---|
| `pixelhelm-ground` | reference | Gate #0 on every intent except a pure LEARN — resolve contract + profile + fresh docs + lessons. |
| `pixelhelm-reference` | reference | a NEW DESIGN / REDESIGN needs north-stars + a grounded brief (knowledge-as-data retrieval). |
| `pixelhelm-directions` | direction | NEW DESIGN / REDESIGN and the owner has NOT mandated a look — N named directions on real data, owner picks. On the HANDS-ON branch (profile `ownerInvolvement: "hands-on"`) this is MANDATORY before any production tournament, not conditional. |
| `pixelhelm-generate` | generate | a chosen direction must become production UI — runs the taste-engine tournament. |
| `pixelhelm-render` | render | any candidate or existing surface must be screenshotted (both viewports, light+dark, reduced-motion). |
| `pixelhelm-evaluate` | evaluate | grading is needed — Layer-1 machine gates + Layer-2 lens, with the baseline. |
| `pixelhelm-judge` | council | the tournament needs a winner judged, or REVIEW wants the 7-seat panel. |
| `pixelhelm-repair` | fix | a Layer-1 FAIL or a [Blocker]/[High] finding must be cleared — smallest change, targeted. |
| `pixelhelm-tokens` | (token source) | TOKENS intent, or any time the contract itself is created/changed. Single source of truth. |
| `pixelhelm-color` | color | COLOR intent, or a contrast/palette finding. |
| `pixelhelm-typography` | typography | TYPOGRAPHY intent, or a type finding. |
| `pixelhelm-motion` | motion | MOTION intent, or a motion-a11y / animation finding. |
| `pixelhelm-email` | email | EMAIL intent. |
| `pixelhelm-dataviz` | dataviz | DATAVIZ intent, or a chart/encoding/dense-table finding. |
| `pixelhelm-content` | content | CONTENT intent, or a copy/label/empty-state finding from the evaluate content phase. |
| `pixelhelm-video-placement` | video | VIDEO intent (situational; correctness floor + register trust matrix). |
| `pixelhelm-evidence-brief` | reference | seated by `pixelhelm-ground` on a HIGH-STAKES new design/redesign — a verified, cited brief consumed as constraints. Never every pass. |
| `pixelhelm-record-lesson` | learn | LEARN intent (standalone, user-invoked refresh), or a sibling reporting a verified correction (WRITE-BACK). |

The craft skills (`pixelhelm-color`/`pixelhelm-typography`/`pixelhelm-motion`/`pixelhelm-email`/
`pixelhelm-dataviz`/`pixelhelm-content`/`pixelhelm-video-placement`) also attach by concern or file path;
dispatch explicitly only when the request centers on that concern or a finding points at it.

---

## 3. Per-intent gate sequences

Gate #0 GROUND runs first on all but LEARN. `[brackets]` = conditional.
`{HANDS-ON: ...}` = an owner checkpoint that runs ONLY when the profile's
`ownerInvolvement` is `"hands-on"` (SKILL.md "Owner-involvement modes"); on the
autonomous default the sequence reads without the `{...}` lines — unchanged.

**NEW DESIGN**
```
pixelhelm-ground
  {HANDS-ON: ground-confirm — register + referenceSources + constraints; 1 question}
  -> ELICITATION GATE (REQUIRED, both involvement modes — gates-and-loop.md §0)
     ask what the surface should FEEL like / the wanted register / reference
     points; capture the answer VERBATIM into the ground context BEFORE any
     direction intent is written, or record an explicit owner waiver.
     A run that did neither is a process defect: the run record is refused.
  -> [pixelhelm-reference]            (north-stars + brief, if not already briefed)
  -> [pixelhelm-directions]            (if no look is mandated -> owner picks a thesis)
                                   {HANDS-ON: MANDATORY unless a look is mandated —
                                    owner picks on 2-3 throwaway mockups BEFORE any
                                    production candidate is built}
  -> pixelhelm-generate               (tournament: N taste engines -> N candidates)
  -> pixelhelm-render                 (each candidate: desktop+mobile, light+dark)
  -> pixelhelm-evaluate               (Layer-1 eliminates failing candidates first)
  -> pixelhelm-judge                (judge the survivors -> winner; writes the verdict record)
  {HANDS-ON: bar-check — verdict + finalists; "does ANY reach your bar?" BEFORE the fix loop}
  -> LOOP (iterate on the winner)  -> owner approval gate -> CLOSE THE LOOP
                                      (sign-off record; correction -> pixelhelm-record-lesson WRITE-BACK;
                                       taste clarification -> profile _taste diff — SKILL.md)
```

**REDESIGN**
```
pixelhelm-ground
  {HANDS-ON: ground-confirm — register + referenceSources + constraints; 1 question}
  -> pixelhelm-render(current) + pixelhelm-evaluate(current)   (honest baseline + diagnosis)
  -> ELICITATION GATE (REQUIRED — gates-and-loop.md §0; same rule as NEW DESIGN,
     asked BEFORE the delta thesis, not after the field exists)
  -> [pixelhelm-directions]            (delta thesis, if the look is open)
                                   {HANDS-ON: MANDATORY for the tournament method —
                                    owner picks the delta thesis on throwaway mockups}
  -> pixelhelm-generate(delta)        (tournament on the changed surface)
  -> pixelhelm-render -> pixelhelm-evaluate -> pixelhelm-judge (verdict record written)
  {HANDS-ON: bar-check — verdict + finalists vs the incumbent, BEFORE the fix loop}
  -> LOOP -> owner approval gate -> CLOSE THE LOOP (as in NEW DESIGN)
```
Archive the current state BEFORE any change (honest before/after + safe revert):
`pixelhelm-render` saves to the DURABLE data dir — `<dataDir>/baselines/<project>/` (or the
path the profile sets); NEVER inside the plugin directory, which is replaced on update
(store map: `references/close-the-loop.md`). This is a hard requirement for REDESIGN.

Incumbent is a competitor (REDESIGN only — MANDATORY). The current/live design is NOT
just an archived baseline; it is entered into the tournament as a labeled competitor named
`incumbent`. Concretely:
- The same `pixelhelm-render` pass that captures the baseline ALSO adds the incumbent to the
  council candidate set (same viewports + modes as the new directions).
- `pixelhelm-judge` scores the incumbent alongside the new directions on every lens,
  including register-fit.
- The REDESIGN may ship a new direction only if it CLEARS THE GUARD in
  `references/gates-and-loop.md` Section 7 (beats the incumbent on the weighted score AND not
  below it on register-fit). If nothing clears the guard, the loop reports "current design
  wins — no change recommended" and STOPS.
A REDESIGN tournament that judges new directions only against each other + a brief, with no
incumbent in the candidate set, is a routing FAIL (it cannot detect a regression).

REDESIGN has TWO methods, selected by headroom (the router picks before generating):
- **Tournament** (bad→good, big headroom) — N bold new directions + the incumbent → council
  → guard. The default when the current surface is generic, off-register, or far from where
  it should land.
- **Incremental polish** (good→great, already-on-register) — generate a ranked set of small,
  surgical diffs OFF the incumbent (one change each), render each, and A/B every diff against
  the incumbent under the SAME incumbent guard; keep only diffs that improve overall without
  lowering register-fit, then stack the winners. Nothing on-register is torn out. Use this
  when the incumbent already clears register-fit and only headroom is craft polish — the
  tournament is the wrong instrument for an already-good design (it explores far from what
  works and tends to rip out the good parts). The recipe lives in
  `${CLAUDE_PLUGIN_ROOT}/skills/pixelhelm-generate/references/incremental-polish.md`. The
  incumbent guard (`references/gates-and-loop.md` Section 7) is shared by both methods.

**REVIEW / EVAL** (usable standalone, day one)
```
pixelhelm-ground (light: contract + profile only)
  -> pixelhelm-render
  -> pixelhelm-evaluate (Layer-1 + Layer-2 + baseline classification)
  -> [pixelhelm-judge] (if a multi-lens panel was asked for)
  -> STOP: report the merged, severity-ranked findings + the honest banner. No edits.
     (If the owner REACTS with a verdict/correction, still CLOSE THE LOOP — record it.)
```

**FIX**
```
pixelhelm-ground
  -> pixelhelm-render -> pixelhelm-evaluate (confirm the finding still reproduces)
  -> pixelhelm-repair    (smallest change that clears the specific finding)
  -> pixelhelm-render(affected viewport) -> pixelhelm-evaluate (prove it cleared, nothing regressed)
  -> repeat within the 3-iteration cap
```

**TOKENS / COLOR / TYPOGRAPHY / MOTION**
```
pixelhelm-ground
  -> pixelhelm-tokens          (the contract; single source of truth)
  -> pixelhelm-color / pixelhelm-typography / pixelhelm-motion   (emit values INTO the contract)
  -> pixelhelm-evaluate Layer-1 conformance (assert the rendered output matches the tokens)
```

**EMAIL**
```
pixelhelm-ground
  -> pixelhelm-email           (600px canvas, no background-dependent chips, email-safe CSS)
  -> reuse pixelhelm-evaluate's contrast gate within the email-safe subset
```

**DATAVIZ / CONTENT / VIDEO** (craft intents)
```
pixelhelm-ground -> pixelhelm-dataviz | pixelhelm-content | pixelhelm-video-placement (the craft pass)
  -> pixelhelm-render -> pixelhelm-evaluate     (when the pass changed a rendered surface)
```

**LEARN** (may skip Gate #0)
```
pixelhelm-record-lesson (version-stamped, expiring lessons + fingerprint-registry update; owner-reviewed)
```
Also fires WITHOUT the user asking when a sibling reports a verified correction
(the router's Close-the-loop step dispatches WRITE-BACK).

---

## 4. Disambiguation rules (when two intents fit)

- "Review it then fix it" -> start at **REVIEW**, then let the loop carry into FIX
  (render -> evaluate already ran; reuse them).
- "Make this better" with no look mandated -> **REDESIGN** (which may open with
  DIRECTION). With a look mandated -> REDESIGN straight into generate.
- "Set up our colors as tokens" -> **TOKENS** (contract) with COLOR emitting into it,
  not COLOR alone.
- "Design a screen and a matching email" -> two intents; run NEW DESIGN, then EMAIL,
  both grounded on the same contract.
- When still ambiguous, pick the **earliest intent in the loop** so later gates can
  carry the work forward, and note the assumption in the Decision Audit Trail.

---

## 5. Near-miss exclusions (do NOT route to the design router)

Route these elsewhere — the design router would be the wrong first action:

- Pure backend / data / API / business-logic work with no UI surface.
- Copywriting unconnected to a surface being designed (UX writing *inside* a design
  pass stays in the loop; standalone blog/marketing copy does not).
- A general code review or security review of non-UI code -> the repo's code-review /
  security-review skills.
- "Make the build pass" / CI / deployment plumbing -> not a design intent (even though
  the token AA lockstep can fail a build, fixing infra is not design).
- Asking a factual question about a framework/library API -> answer directly or use the
  relevant docs skill; do not spin up the design loop.
