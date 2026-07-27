# pixelhelm-content — the craft canon

> The taste canon for interface copy. Read this when writing or critiquing any UI string.
> Three parts: (1) the five laws with before/after; (2) the default-LLM copy tells to avoid
> (the anti-slop tell-set for words); (3) the exit tests that make "good copy" checkable.
> Source: anthropics `frontend-design/SKILL.md` "More on writing in design" (the seed text),
> extended into a working canon.

## Contents
- [Part 1 — The five laws](#part-1--the-five-laws)
- [Part 2 — The anti-slop tell-set (default-LLM copy to avoid)](#part-2--the-anti-slop-tell-set)
- [Part 3 — Exit tests (make "good copy" checkable)](#part-3--exit-tests)

---

## Part 1 — The five laws

The seed principle: *"Words appear in a design for one reason: to make it easier to
understand, and therefore easier to use. They are design material, not decoration."*
Everything below serves that.

### Law 1 — Name by what people control, not how the system is built

Write from the end user's side of the screen. Name things by what people recognize and
control, never by the implementation. Describe what something does in plain terms rather
than selling it. **Being specific is always better than being clever.**

| System-shaped (avoid) | User-shaped (prefer) | Why |
|---|---|---|
| Webhook configuration | Notifications | The user manages an outcome, not the mechanism |
| User entities / records | Team members / People | A human noun, recognizable |
| Authentication failed | Wrong email or password | Names what the person can fix |
| Sync conflict resolution | Choose which version to keep | The decision the user actually makes |
| Execute query | Run report / Search | The user's goal, not the engine's verb |
| Untitled-1 | Name this document | Invites the action instead of labeling a gap |

A clever name ("Magic Sync™") fails Law 1 twice — it's both implementation-flavored and
selling. Specific and plain wins.

### Law 2 — Active voice; a control says exactly what happens

The default voice is active. A control should say exactly what happens when it's used.

| Vague / passive (avoid) | Active, says-what-happens (prefer) |
|---|---|
| Submit | Save changes / Send invite / Publish |
| OK (on a delete dialog) | Delete project |
| Continue (ambiguous) | Create account / Pay $40 / Next: shipping |
| Confirm | Cancel subscription / Merge accounts |
| Apply | Apply filters / Save & apply |

The button's words are a promise about the result. "Submit" promises nothing; "Pay $40"
tells the person exactly what the click does. Never use a button to sell ("Get started
free!") when it could state the action ("Create your account").

### Law 3 — One action keeps ONE name through the whole flow

The vocabulary of an interface is the signposting for someone navigating the product.
Cohesion and consistency are how people learn their way around. An action keeps the same
name end to end:

```
Button:        Publish
Confirmation:  Publish this post?
Toast:         Published
History row:   Published 2m ago
Empty/undo:    Unpublish
```

Breaking the chain ("Publish" → toast "Your content is now live!" → log "Content status:
active") forces the user to re-learn the same action three times. The button/toast/history
triple is the fastest consistency check — verify it explicitly (see Part 3).

### Law 4 — Errors explain + recover; never apologize, never vague

Treat failure as a moment for direction, not mood. An error does two jobs: **say what went
wrong**, and **say the next step to fix it** — in the interface's voice, not a person's.

- Errors **don't apologize.** "Sorry, something went wrong" puts a fake human emotion where
  a fix should be. Drop the apology; give the recovery.
- Errors are **never vague.** "An error occurred" / "Oops!" / a bare status code tells the
  person nothing actionable.

| Apologetic / vague (avoid) | Explains + recovers (prefer) |
|---|---|
| Oops! Something went wrong. | Couldn't save — you're offline. Changes are kept; they'll sync when you reconnect. |
| Error 403. | You don't have access to this project. Ask the owner to invite you. |
| Invalid input. | Enter a date in the future — this one has passed. |
| Sorry, that didn't work. | Card declined. Check the number, or try another card. |
| Upload failed. | File is over the 10 MB limit. Try a smaller file or a link. |

The voice is the interface's, calm and factual. Match the *temperature* of the hedge to the
register (a serious-trust product stays plainer; see `registers.md`) — but never trade the
recovery step for warmth.

### Law 5 — Empty states are invitations, not dead ends

An empty screen is an invitation to act. It says three things: **what goes here**, **why
it's worth doing**, and **the one action to start.** "No items" is a dead end; it tells the
user nothing and offers nothing.

| Dead-end (avoid) | Invitation (prefer) |
|---|---|
| No projects. | No projects yet. Create one to start tracking work. [New project] |
| 0 results. | Nothing matches "{query}". Try fewer words or clear the filters. |
| Empty inbox. | You're all caught up. New messages will land here. |
| No data available. | No claims yet — they'll appear here once a candidate files one. |

Distinguish the FIRST-RUN empty (never had data → invite + reason + action) from the
FILTERED empty (had data, filter hides it → say what's filtered + how to widen) from the
CLEARED empty (done everything → reassure, no action needed). They are different copy jobs.

### The standing register (applies to every string)

- **Sentence case**, not Title Case. ("Save changes", not "Save Changes".)
- **Plain verbs, no filler.** Cut "please", "simply", "just", "in order to".
- **No unearned exclamation or emoji** as a personality substitute.
- **One element, one job.** A label labels; an example demonstrates; helper text helps.
  Nothing quietly does double duty — don't make a label also be the error.
- **Tone matched to the brand + audience** (`registers.md`) — never a generic friendly default.

---

## Part 2 — The anti-slop tell-set

Default-LLM interface copy clusters around a small set of recognizable strings. They are
*defaults, not choices* — they appear regardless of the product. When a string matches one,
rewrite it from the product's own vocabulary. (The visual analog is `pixelhelm-directions`'s
three AI-default clusters; this is the verbal one.)

**Error/empty tells**
- "Oops! Something went wrong." / "Whoops!" / "Uh oh!"
- "An error occurred. Please try again later." (no cause, no recovery)
- A bare error code with no human sentence.
- "No items to display." / "Nothing here yet." (dead-end empty with no invitation)

**Button/CTA tells**
- "Submit" (use the actual action), "OK" / "Confirm" on a consequential dialog.
- "Get Started" / "Get started today", "Learn more", "Read more", "Click here".
- "Sign up free!" / "Try it now!" — selling where the action should be stated.

**Heading/marketing tells (product UI)**
- "Welcome back!" / "Welcome to {Product}!"
- "Manage your {anything}" as a page title (system-shaped + generic).
- Marketing adjectives in a product surface: "seamless", "powerful", "effortless",
  "robust", "intuitive", "delightful", "supercharge", "unlock", "elevate".
- Emoji as personality (✨🚀🎉) and exclamation-as-enthusiasm.

**Voice tells**
- **Em dashes in body copy — the loudest one, and an owner-banned tell.** Registered as
  the `ai-em-dash-copy` fingerprint (seeds registry, scope global). Owner, on the E3
  editorial arms where it appeared in ALL THREE, 2026-07-26: *"em dashes present in all
  arms - not supposed to be there."* Use a period, a comma, a colon, or restructure the
  sentence. Not the tell: an en dash range (`2020–2024`), or the em dash as a table's
  data-absent glyph.
- **Uniform paragraph rhythm** — every paragraph two-to-three sentences, every section
  the same length, every list the same item count. Human prose varies; the metronome is
  the tell (`uniform-paragraph-rhythm`, candidate).
- "We" apologizing ("We're sorry…") — the interface, not a person, is talking.
- "Please" / "simply" / "just" / "in order to" filler.
- Title Case On Every Button.
- Helper text that restates the label ("Email" / "Enter your email").

A tell is not always wrong — context can earn it (a genuine celebration screen may earn one
exclamation). But each must be a *choice you can justify for this product*, never the
reflexive default.

---

## Part 3 — Exit tests (make "good copy" checkable)

Run these before shipping a string set. They convert "is this good?" into yes/no checks.

- **Read-aloud test.** Read each string aloud in the interface's voice. If it sounds like a
  person apologizing, a marketer selling, or a database describing itself — rewrite it.
- **Swap test.** Could this exact string appear verbatim in a *different* product? If yes
  (e.g. "Get started", "Manage your account"), it's a default, not a choice — re-derive it
  from this product's nouns.
- **What-happens test (buttons).** Does the control name the result of the click? If a user
  could not predict what happens from the button alone, make it active and specific.
- **Recovery test (errors).** Does the message name the cause AND the next step? If either is
  missing, it fails — no apology substitutes for a recovery step.
- **Invitation test (empty).** Does the blank state say what-goes-here + why + the one action
  to start? "No X" alone fails.
- **One-name test (flow).** Trace one action through button → confirmation → toast → history.
  Same verb every step? A rename anywhere is a defect.
- **One-job test.** Does each string do exactly one job? A label that also carries the error,
  or helper text that also sells, fails — split or cut.
- **Chanel's-mirror test.** Remove one word that isn't pulling weight. If the string still
  works, it was filler. Plain and short beats padded.
