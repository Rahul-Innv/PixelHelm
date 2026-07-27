# design-content — per-project tone registers + honesty deference

> Read this before writing any string, to load the active project's VOICE. Two parts: (1) the
> per-project registers — the SAME craft laws, a DIFFERENT tone, never homogenized; (2) how copy
> defers to the honesty bindings on money/safety/facts surfaces. Sources: build-spec PLAN §7
> register mandate; `profiles/<project>.json` (`_register`); `design-direction`'s
> honesty-and-registers reference. The visual register lives in design-direction; this is its
> verbal twin — keep them consistent for the same project.

## How to load the register

1. Resolve the active project (the router passes it; else infer from the working directory; else
   ASK — do not default to a generic friendly voice).
2. Read the machine profile at `${CLAUDE_PLUGIN_ROOT}/profiles/<project>.json` — the `_register`
   field is the binding tone summary; the visual `bannedClusters` don't constrain copy but the
   register note does.
3. Write every string in that register's voice. The five laws (`canon.md`) hold for ALL projects;
   only the temperature, formality, and lexicon change.

The core rule: **the same string changes WORDING per register without breaking a law.** An empty
state still invites; an error still explains+recovers — but the warmth differs.

| Job | A regulated trust portal (serious-trust) | A warm consumer app (warm-premium-fun) | An analyst data product (analyst-terminal) |
|---|---|---|---|
| First-run empty | No claims yet. They'll appear here once filed. | No meals logged yet — add your first to start your day. | No positions. Add a ticker to begin tracking. |
| Transient error | Couldn't load. This is temporary; your data is safe. Retry. | Hmm, that didn't load — give it another go. Nothing's lost. | Feed unavailable. Retrying… last good data 14:32. |
| Destructive confirm | Delete this record? This can't be undone. | Delete this entry? You can't get it back. | Delete position? Irreversible. |
| Success toast | Saved. | Saved — nice work. | Saved. |

Same laws, three voices. None is "the right" voice globally; each is right for ITS project.

## The regulated trust portal — fintech-grade serious-trust

Calm, restrained, precise. The voice of Mercury / Vanta / Stripe — earns trust through
discipline, never delight. Example profile note: *"single locked teal palette; operator app
on the .op-* Synthesis register, candidate portal CALM. override role = NEUTRAL (never amber)."*

- **Tone:** plain, factual, low-affect. No exclamation, no emoji, no "nice work!".
- **Errors:** state cause + recovery + that data is safe; never alarming, never apologetic, never
  cute. A money/safety surface stays plainest of all.
- **Empty states:** quiet and informative ("No claims yet."), an invitation without cheer.
- **Lexicon:** precise domain nouns; avoid marketing adjectives entirely. The operator app may be
  a touch more terse (`.op-*`); the candidate portal stays calm and reassuring (high-stakes
  audience), but still never playful.
- **Avoid:** warmth that could read as making light of money/legal/safety stakes.

## The warm consumer app — playful-premium-fun-but-calm

Characterful and warm, but calm — Things 3 / Gentler Streak personality with Linear-grade
discipline. The CORRECT register for a personal daily-wellness app.

- **Tone:** encouraging, human, a light touch of delight — earned, not sprayed. At most one
  exclamation where a real moment justifies it; emoji rare and purposeful.
- **Errors:** friendly but still explain+recover ("Hmm, that didn't load — give it another go.
  Nothing's lost."). Friendly never replaces the recovery step.
- **Empty states:** inviting and motivating ("Add your first meal to start your day.").
- **Reframe negatives** the way the visual register does: "room for ~40 g more", never a
  failure-toned scold. Numbers encourage.
- **Lexicon:** warm, second-person-friendly, concrete; still plain verbs and sentence case.
- **Avoid:** sliding into hype adjectives ("supercharge your nutrition!") — warm ≠ salesy.

## The analyst data product — credible analyst-terminal

Dense, sourced, terse — Bloomberg × Wikipedia (Koyfin / Perplexity / Raycast). Trust comes from
sourcing and credibility, not warmth.

- **Tone:** clipped, information-first, no pleasantries. Fragments are fine where they're denser.
- **Errors:** state the fact + the last-good-state ("Feed unavailable. Last good data 14:32.").
- **Empty states:** minimal and instructive ("No positions. Add a ticker to begin.").
- **Lexicon:** precise financial/analyst terms; the audience knows the domain — plainening here
  means *not vague*, not *dumbed down*. (This is what "user-shaped" means for an expert audience:
  shaped to THAT user, who controls tickers and feeds, not to a layperson.)
- **Avoid:** warmth, encouragement, exclamation, color-coded alarm in copy (red is errors only).

## Two archetypes have a rule about ORDER, not tone

Register is usually about temperature. For these two it is also about what the copy
puts FIRST — a structure rule, recorded from owner verdicts on 2026-07-26.

**Utility / status surfaces — lead with the recommendation.** A surface someone
consults to decide what to do opens with the resolved answer, then its qualifications.
Owner, on the utility winner: *"lead with the recommendation - 'recommended trail' at
the top, then go to the closures."* Write the answer as a sentence a person could act
on, not as a label over a table. The closures, exceptions and full record follow it and
support it; they never precede it as inputs the reader must combine themselves.

**Long-form / data-narrative surfaces — open with the executive brief.** An editorial
or analytic read opens with what the data SAYS, in a sentence or two, before method,
chart or chronology. Owner, on the editorial winner: *"open with an executive brief of
the finding, then the detail."* A narrative that builds to its finding is making the
reader pay for the author's process.

Both yield to the honesty bindings below and to nothing else. When the data cannot
support a confident recommendation, the hedge goes at the top WITH the recommendation
("no trail is clearly best today — here is why"), never further down where the reader
has already acted. Leading with the answer is a duty to the reader, not a licence to
manufacture one.

## The rule

A warm, encouraging error is a SUCCESS for the warm consumer register and a FAILURE for the trust register — same craft,
opposite register. Never carry one project's voice onto another. "User-shaped language" is
relative to the audience: developers, analysts, and first-time consumers each have different
"plain". When the active project is unknown, ASK which project (and which surface — operator vs
candidate, dashboard vs onboarding) before writing.

## Copy defers to the honesty bindings (money/safety/facts surfaces)

When the surface renders claims about money, safety, or facts, the words obey
`design-direction`'s honesty bindings — these OUTRANK tone:

- **The hedge lives in the copy, adjacent to the value.** An unverified estimate's "Unverified"
  / "Estimate" label sits next to the number, not in a footnote. A friendly register may soften
  the *wording* of the hedge but must never delete it or convert it into reassurance.
- **"No data" is an honest empty state**, written as such ("No data yet" / "Not enough data to
  estimate"), never a confident-sounding number or a cheerful filler that implies a value exists.
- **Every number's WHY is one expand away** — the copy for the source/freshness/method must
  exist and be plain, even in a terse register.
- **Never write an invented statistic** into the UI. If the data isn't there, the copy says so.

Tone tunes the *temperature* of a hedge; it never removes the hedge. A consumer-warm hedge and a
trust-plain hedge say the same true thing, differently — both still say it.
