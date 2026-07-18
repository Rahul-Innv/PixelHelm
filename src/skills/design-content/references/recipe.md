# design-content — the writing process & per-surface checklists

> Read this to actually write or rewrite copy. Part 1 is the step-by-step process; Part 2 is a
> checklist per UI surface (errors, empty states, buttons, confirmations, forms, onboarding);
> Part 3 is worked rewrites. The craft rules these enforce live in `canon.md`; the per-project
> tone lives in `registers.md`.

## Contents
- [Part 1 — The writing process](#part-1--the-writing-process)
- [Part 2 — Per-surface checklists](#part-2--per-surface-checklists)
- [Part 3 — Worked rewrites](#part-3--worked-rewrites)

---

## Part 1 — The writing process

Run this in thinking; surface higher-confidence copy to the user, not every draft.

1. **Frame what the surface must SAY.** Before any string, ask what the design needs to
   communicate to help the person navigate. List every string the surface needs:
   - controls (buttons, links, menu items)
   - states (loading, empty/first-run, empty/filtered, success, partial)
   - errors (per failure mode, with its recovery)
   - confirmations (especially destructive ones)
   - labels + helper text (forms)
   - page/section headings
   Note the user's goal at each — copy serves the goal, not the layout.

2. **Brainstorm against the register.** Draft each string applying the five laws (`canon.md`):
   user-shaped nouns, active controls, one verb per action across its flow, errors that
   explain+recover, empty states that invite. Tune temperature to the active register
   (`registers.md`) — same job, different warmth per project.

3. **Critique-vs-generic (anti-slop).** For each string ask: *"if I wrote copy for a similar
   product, would I produce this exact string anyway?"* Cross-check against the tell-set in
   `canon.md` Part 2. Any string that's a default ("Get started", "Oops!", "Manage your X",
   "Submit") gets re-derived from THIS product's vocabulary. State what changed and why.

4. **Build / hand off.** Write the strings into the surface using the product's real nouns,
   OR hand the rewrite to `design-fix` to patch the JSX/DOM (this skill decides words; it does
   not have to apply them). Keep the action vocabulary consistent across the whole flow.

5. **Critique again.** Read every control as a SET, then run the exit tests (`canon.md`
   Part 3): one-name, one-job, recovery, invitation, read-aloud, Chanel's-mirror. Confirm
   sentence case, no filler/apology/unearned exclamation, and that the tone is THIS project's
   register — not homogenized to a generic friendly default.

---

## Part 2 — Per-surface checklists

### Errors
- [ ] Names what went wrong in plain terms (not "an error", not a bare code).
- [ ] Gives the next step to recover (retry, fix input, contact, wait).
- [ ] No apology ("Sorry", "Oops", "We're sorry"), no "we" as a person.
- [ ] Interface's voice — calm, factual, register-tuned temperature.
- [ ] Distinguishes user-fixable (wrong input → tell them what) from system errors (transient
      → say it's temporary + that data is safe) from permission errors (say who to ask).
- [ ] Inline near the cause where possible, not a generic top-of-page banner.
- [ ] Preserves the user's work in the message when work could be lost ("your draft is kept").

### Empty states
- [ ] Says what goes here + why it's worth doing + the one action to start.
- [ ] First-run empty = invitation with a primary action.
- [ ] Filtered empty = "Nothing matches {filter}" + how to widen/clear.
- [ ] Cleared/done empty = reassurance ("You're all caught up"), no forced action.
- [ ] Not a dead end ("No items", "0 results", "No data available").

### Buttons / CTAs
- [ ] States the action and its result (active voice, what-happens test).
- [ ] Sentence case; no Title Case, no trailing exclamation, no emoji-as-personality.
- [ ] Not "Submit / OK / Confirm / Continue" when a specific verb fits.
- [ ] Same verb the action carries through confirmation/toast/history (one-name test).
- [ ] Primary action is the affirmative verb; secondary is "Cancel"/explicit, never just "No".

### Confirmations & destructive actions
- [ ] Title states the consequence as a question ("Delete project?") or statement.
- [ ] Body says what is lost and whether it's reversible ("This can't be undone").
- [ ] Confirm button names the action ("Delete project"), not "OK"/"Yes".
- [ ] Cancel is explicit and safe by default; destructive button is visually + verbally distinct.
- [ ] For high-stakes deletes, the confirm names the object (type-to-confirm copy if used).

### Forms, labels & helper text
- [ ] Labels name what the person provides, in their words (sentence case, no colon needed).
- [ ] Helper text adds information the label can't (format, why it's asked) — never restates it.
- [ ] Placeholder is an example, not the label, and never the only label (it vanishes on type).
- [ ] Validation messages name the fix ("Use 8+ characters"), not the rule violation.
- [ ] Required/optional is explicit; the rarer case is marked.
- [ ] Each element does one job: label labels, helper helps, error recovers — no overlap.

### Onboarding / first-run
- [ ] Leads with the user's goal/value, not "Welcome to {Product}!".
- [ ] Each step states the action and what it unlocks; skippable steps say so.
- [ ] No marketing adjectives ("powerful", "seamless") inside the product surface.
- [ ] Ends by handing the user a real first action, not a celebration with no next step.

### Loading / progress / success
- [ ] Loading copy says what's happening if it's slow ("Importing 1,240 rows…"), else nothing.
- [ ] Success confirms the result in the action's verb ("Published", "Invite sent").
- [ ] Partial success names what succeeded AND what didn't, with the recovery for the failures.

---

## Part 3 — Worked rewrites

These show the process producing real strings. Tone shown is neutral; adjust per `registers.md`.

### A — A delete confirmation (Laws 2, 3, 4)

```
Before:
  Dialog title: Are you sure?
  Body:         This action cannot be undone.
  Buttons:      [Cancel] [OK]

After:
  Dialog title: Delete "Q3 Roadmap"?
  Body:         Its 14 tasks and comments will be removed. This can't be undone.
  Buttons:      [Keep project] [Delete project]
What changed: title names the object + consequence; body names what's lost + irreversibility;
the confirm button carries the action's verb (one-name with the "Delete" entry point), so the
user never confirms a generic "OK". "Keep project" is clearer than "Cancel" at the decision.
```

### B — An error (Law 4: explain + recover, no apology)

```
Before:  Oops! Something went wrong. Please try again later.
After:   Couldn't send the invite — {email} isn't a valid address. Check it and resend.
What changed: drops the apology + the dead "try later"; names the cause (bad address) and the
exact recovery (fix + resend). If the failure were transient instead: "Couldn't send right now
— this is on our side. Your invite is saved; try resending in a minute."
```

### C — An empty state (Law 5: invitation)

```
Before:  No reports.
After:   No reports yet. Build one to see your team's activity over time. [New report]
Filtered variant: Nothing matches "marketing" in the last 30 days. Clear the filters to see all.
What changed: first-run gives what-goes-here + why + the one action; the filtered case is a
different copy job (says what's filtered + how to widen), not the same string reused.
```

### D — A flow's one-name chain (Law 3)

```
Before (renamed at each step):
  Button "Invite"  →  toast "Your teammate has been added!"  →  log "User provisioned"
After (one name):
  Button "Send invite"  →  toast "Invite sent"  →  log "Invite sent to {email}"
What changed: one verb ("invite") signposts the action end to end; the toast and log stop
forcing the user to re-learn the same action under two new names.
```

### E — System-shaped → user-shaped (Law 1)

```
Before:  Heading "Webhook Configuration"  ·  field "Endpoint URL"  ·  button "Execute Test"
After:   Heading "Notifications"  ·  field "Where should we send these?"  ·  button "Send a test"
What changed: names the outcome the user controls (notifications), asks for the value in plain
terms, and the button states the action. (If the audience IS developers, the register may keep
"Endpoint URL" — see registers.md; user-shaped still means "shaped to THAT user".)
```
