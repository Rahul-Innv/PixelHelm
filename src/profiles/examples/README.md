# Project profiles

A profile is the plugin's contract with ONE project: where the source lives,
the AA token contract the gates enforce, the banned cliche clusters, and —
most importantly — the **`_register` string** the register-fit gate judges
every design against. No profile, no taste work: `design-ground` refuses to
proceed past grounding without one, and the council ABSTAIN-BLOCKS on a
missing `_register` (it never guesses your brand).

## Where profiles live (resolution order)

1. `<your-project>/.design/profile.json` — **preferred**: commits with the
   repo, travels with the code, accrues `_taste` over time.
2. `<durable-data-dir>/profiles/<project>.json` — for projects whose repo you
   can't or don't want to touch. The durable data dir is
   `$CLAUDE_PLUGIN_DATA` if set, else `~/.claude/design-pixelhelm/`.
3. Nothing found → `design-ground` offers to CREATE `#1` from
   `examples/example.json`, asking you for the register in your own words.

Never keep a real profile inside the installed plugin directory — it is
replaced wholesale on every plugin update.

## Creating one

Copy `examples/example.json`, then:

1. Set `project`, `root`, `sourceDirs`, `sourceExts`, `ignore`.
2. Wire the AA contract: EITHER point `tokenModule` at an ESM module that
   exports `evaluateGatedPairs()` (or `TOKENS` + `GATED_PAIRS`) — the gate
   then enforces YOUR real token contract — OR inline `tokens` (both modes) +
   `gatedPairs`. TypeScript modules can't be dynamically imported; inline the
   resolved values instead.
3. List `allowRawColorIn` — the only files allowed to carry raw hex (your
   token source + generated token blocks).
4. Write `_register` — the single most load-bearing string in the file. The
   register-fit gate scores candidates against these exact words, so say what
   the product should FEEL like, what is banned, and name comparable products.
5. Optionally seed `_northStars` and leave `_taste` empty — the plugin's
   close-the-loop step proposes `_taste` entries as your sign-offs accrue.
6. Pick `ownerInvolvement`: `"hands-on"` adds cheap early checkpoints (confirm
   the grounding, pick a direction on throwaway mockups, sanity-check the
   council verdict against your bar) BEFORE the expensive stages; `"autonomous"`
   (the default) is the classic loop with one final approval gate. Leave it
   unset and the router asks once at run start and offers to record your answer.

## What reads it

- The `design` router — reads `ownerInvolvement` at Phase 0 to pick the
  hands-on or autonomous branch (asks once when unset).
- `design-ground` — merges the profile into every pass's ground context.
- `design-evaluate` Layer-1 — contrast gate (tokenModule or inline pairs),
  raw-color walk (`allowRawColorIn`), cliche grep (`bannedClusters`).
- `design-council` — the register-fit gate binds to the literal `_register`;
  jurors may read `_taste.registerClarifications` as elaborations of it.
- `design-learn` — proposes reviewable diffs to `bannedClusters` and `_taste`;
  never edits silently.
