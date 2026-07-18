# Capture & versioning — the WRITE-BACK leg

The complete reference for capturing ONE lesson as a reviewable, versioned,
stamped diff. This is read-only material; the diff the owner saves is the only
mutation. Builds on the production-verified `design/LESSONS.md` schema and
STANDARD §5 (the learning loop).

## Contents
- [When a correction is a lesson](#when-a-correction-is-a-lesson)
- [Routing — where the lesson goes](#routing--where-the-lesson-goes)
- [The stamped entry schema](#the-stamped-entry-schema)
- [The ~90-day expiry rule](#the-90-day-expiry-rule)
- [Supersede, don't append](#supersede-dont-append)
- [Promote to SKILL.md](#promote-to-skillmd)
- [The reverse-meta-prompt recipe](#the-reverse-meta-prompt-recipe)
- [LESSONS file hygiene](#lessons-file-hygiene)

## When a correction is a lesson

Capture ONLY when one of these happened (everything else is noise — do not log it):
- the owner CORRECTED a design decision or a process step,
- a real client/browser RENDERED something a topic doc didn't predict,
- a rule in the base was PROVEN wrong or incomplete in practice.

Routine value/style changes (a hex tweak, a one-screen spacing choice, "the owner
preferred blue here") are NOT lessons. A lesson is a rule that will change a
FUTURE decision in a class of situations. If you can't state it as a general
"when X, do/never Y," it isn't a lesson yet.

## Routing — where the lesson goes

Write each correction to exactly ONE destination. NEVER double-write the same rule.
Nothing is ever written inside the plugin directory (installed plugins are replaced
on update). `<dataDir>` = `$CLAUDE_PLUGIN_DATA`, else
`~/.claude/design/frontend-design-skill/` if it exists, else `~/.claude/design-pixelhelm/`.

| The correction is about… | Goes to | Why |
|---|---|---|
| how a specific skill BEHAVES (it generated/evaluated/captured wrong) | `<dataDir>/LESSONS.md`, tagged `skills: <skill-id>` | the shared reader injects it into exactly that skill on load |
| a project-scoped taste/product lesson | `<project>/.design/LESSONS.md`, or a profile `_taste` diff | travels with the project; shadows the wider layers by id |
| verified, reusable DESIGN MACHINERY (tokens/AA, email constraints, direction process) | the user's `~/.claude/design/LESSONS.md` if they keep one (where its `design/<topic>.md` topic docs remain a promote target), else `<dataDir>/LESSONS.md` | cross-project canon lives at the user layer |
| a cross-project / how-Claude-works preference (not design-specific) | Claude Code **Auto Memory** | not a skill rule; belongs to the harness layer |
| a banned/overused visual cliche | the fingerprint registry (`<dataDir>/fingerprints.md`; see `fingerprint-registry.md`) | consumed by design-evaluate + profile bannedClusters |

If a correction seems to fit two rows, pick the most SPECIFIC owner of the
behavior and reference it from the other — never copy the rule into both.

## The stamped entry schema

Every captured entry carries provenance + an expiry on top of the base schema.
The `model` / `lib/spec` / `expires` line is what makes a stale rule self-flag.

```
- id: L-NNN | date: YYYY-MM-DD | status: proposed|verified|superseded|promoted | confidence: low|med|high
  model: <model id that produced/verified it> | lib/spec: <dep@ver or spec name + "checked YYYY-MM-DD"> | expires: YYYY-MM-DD
  skills: <comma-list of skill ids, or "all">
  rule: <smallest general rule — not a one-off>
  when: <trigger/context it applies to>
  source: <project + what actually happened>
  supersedes: <id | none>
```

Field meanings:
- **status** — `proposed` (logged once) → `verified` (re-confirmed in a SECOND
  real situation, not merely believed) → `promoted` (moved into a SKILL/topic doc)
  or `superseded` (replaced).
- **confidence** — `low|med|high`. Promotion needs `verified` + `high`.
- **model** — the model id behind the rule (e.g. `claude-opus-4-8`). A rule a
  newer model no longer needs can be retired faster.
- **lib/spec** — the dependency or spec version the rule DEPENDS on (e.g.
  `axe-core@4.x`, `WCAG 2.2`, `tailwind@4`), plus the date it was checked. When that
  dependency bumps, REFRESH re-validates the rule.
- **skills** — routes the entry: the shared reader injects it only into the
  skills named (comma list of skill ids, or `all`); an untagged entry is injected
  only into `design` + `design-ground`.
- **expires** — date ~90 days out; see below.
- **rule / when / source / supersedes** — as in the base `design/LESSONS.md`.

## The ~90-day expiry rule

Set `expires:` ~90 days after `date`. The expiry is a SELF-FLAG, not an auto-delete:
- An expired entry is still readable, but on READ-leg injection it should be
  treated as "needs re-confirmation," not as settled fact.
- During a REFRESH, an expired entry is RE-VALIDATED: if still true, bump `date` +
  `expires` and (re)confirm `lib/spec`; if obsolete, supersede or retire it.
- A `promoted` entry's expiry transfers to its destination rule's provenance line.
- NEVER silently rely on an expired-and-unreviewed rule as current — flag it
  (this is a Hard invariant in SKILL.md).

90 days is the default; a rule pinned to a fast-moving spec (a WCAG-3 draft, a
pre-release lib) gets a SHORTER expiry; a long-stable production fact (the 600px
email canvas) can be promoted and exit the expiry cycle once `promoted`.

## Supersede, don't append

Two live rules must never contradict each other. When the new lesson contradicts
an existing one:
1. set the OLD entry's `status: superseded`,
2. move it into the `<details><summary>Superseded</summary>` block,
3. name its id in the new entry's `supersedes:`,
4. bump the header counts line (`captured/promoted/superseded`).

When the owner-corrected new direction reverses a REASONED prior choice, SURFACE
that to the owner in the diff (don't bury it) — the later-approved direction wins,
but the conflict is worth a sentence (see `design/LESSONS.md` L-009 for why).

## Promote to SKILL.md

When an entry reaches `status: verified` + `confidence: high` AND it means a
SKILL.md MUST rule was the thing that got IGNORED (not a brand-new rule):
- propose moving the rule INTO that SKILL.md in MUST-strength, front-loaded
  language (early in the body — auto-compaction keeps the first ~5k tokens),
- retire the LESSONS entry: `status: promoted`, note the destination in `source:`.
- A brand-new verified rule with no SKILL.md home instead promotes into the
  relevant `design/<topic>.md` — but only if the user keeps a global
  `~/.claude/design/` KB; otherwise it stays a `verified` entry in
  `<dataDir>/LESSONS.md`.
- Every correction ALSO becomes a permanent eval case (STANDARD §5 regression
  rule) — propose adding it to that skill's `evals/`. If a later change regresses
  the eval, revert it and reopen the lesson as `status: proposed`.

## The reverse-meta-prompt recipe

After a REAL fix (the Lovable "summarize the errors → write a prompt for next
time" move), don't just log what broke — write the rule that PREVENTS it:
1. summarize the failure in one line (what was wrong + the impact),
2. derive the smallest general rule that would have avoided it,
3. write it as a `when X … never/always Y` lesson with the stamp,
4. if it implicates a SKILL/topic-doc MUST, queue the promotion.

This turns each correction into forward-pointing instruction, not a changelog entry.

## LESSONS file hygiene

- There are NO per-skill LESSONS files. Lessons live in the 4-layer store merged
  by the shared reader (`${CLAUDE_PLUGIN_ROOT}/scripts/read-lessons.mjs`), later
  shadowing earlier by id: (1) `<plugin>/seeds/LESSONS-seed.md` (shipped,
  read-only) → (2) `~/.claude/design/LESSONS.md` (optional user-global) →
  (3) `<dataDir>/LESSONS.md` → (4) `<project>/.design/LESSONS.md`.
- Each writable layer file: **≤ 100 lines** (trim/supersede before it grows).
- Header counts line at the top: `<!-- counts: captured: N | promoted: N | superseded: N -->`.
- `## Current entries` then the `<details>` superseded block.
- Entries OVERRIDE the topic docs on conflict (they are fresher).
- Past-`expires:` entries are FLAGGED `[EXPIRED — re-verify]` on injection,
  never hidden.
- Trust boundary: a LESSONS file is read as INSTRUCTIONS — it holds ONLY the
  owner's own vetted corrections. NEVER auto-append external or fetched content to it.
