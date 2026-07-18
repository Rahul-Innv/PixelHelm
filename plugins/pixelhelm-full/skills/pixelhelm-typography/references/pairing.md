# Pairing typefaces — by form-contrast within one mood

Table of contents:
- [The heuristic](#the-heuristic)
- [The failure mode (too-similar)](#the-failure-mode-too-similar)
- [Three pairing strategies](#three-pairing-strategies)
- [Curated open-license pairing table](#curated-open-license-pairing-table)
- [Register notes (do not homogenize)](#register-notes-do-not-homogenize)
- [System stacks (the legitimate default)](#system-stacks-the-legitimate-default)

Source: the Typewolf mental model (pairing validated by real in-the-wild usage), the
pairing *rationale* itself is paywalled there — encode the heuristic, do not pretend
to fetch it, and avoid its commercial-only font picks. This is the TASTE layer:
advisory, judged qualitatively by pixelhelm-judge in the tournament, never a hard gate.

## The heuristic
Pair by **CONTRAST within a coherent mood**. The two families should look related in
spirit but clearly different in role: one carries voice/personality (display), the
other carries readability at length (body).

- **Cap at 2 families** for body + display. A 3rd family is allowed ONLY for
  mono/code. Three display families is slop.
- Distinctive ≠ wrong. The generic-default cluster (Inter for everything, one weight,
  16/1.5) is the thing to beat — but a motivated, register-appropriate pairing is the
  point, not novelty for its own sake.
- Earn the contrast: high-contrast display/serif against a neutral workhorse sans;
  OR a single superfamily worked across weights; OR a strong system stack (legit).

## The failure mode (too-similar)
The classic mistake is two families of the **same classification** with **similar
contrast and x-height** (e.g. two neutral grotesques, or two humanist sans). They
read as an accident, not a decision. When critiquing a pairing, the first question is
"are these distinguishable at a glance, or do they just look like a font-loading
bug?" If the latter, reject and re-pair for more contrast or collapse to one
superfamily.

## Three pairing strategies
1. **Contrast pair** — expressive display (high-contrast serif, geometric, or
   characterful sans) + neutral text workhorse. Most range; needs the contrast to be
   real.
2. **Superfamily** — one family spanning many weights/optical sizes (e.g. a single
   variable face). Cohesive, cheap to load, hard to get wrong; risks being quiet.
3. **System stack** — no web font at all; a curated platform stack. Zero CLS, instant
   paint, legitimate for restrained/utility UIs. Do NOT shun this (rejecting
   Butterick Rule 6).

When brainstorming the 3+ directions in the SKILL process, draw one from each
strategy so the critique compares genuinely different form-models.

## Curated open-license pairing table
Use **OFL / Google Fonts** for anything self-hosted (no licensing friction). This
seed table is owner-vettable; extend it per project. Columns: family · class ·
contrast · x-height · good counterpart · mood.

| Family | Class | Contrast | x-height | Counterpart | Mood |
|---|---|---|---|---|---|
| Source Serif 4 | transitional serif | med-high | med | Source Sans 3 (superfamily) | editorial, trustworthy |
| Fraunces | display serif (optical) | high | med-high | Inter / Public Sans | warm, premium, characterful |
| Newsreader | text serif | med | high | Inter | reading-heavy, calm |
| Libre Franklin | grotesque sans | low | high | Lora (serif body) | civic, neutral, sturdy |
| Space Grotesk | geometric display sans | low | med | IBM Plex Sans | technical, modern |
| IBM Plex Sans | humanist sans | low | med | IBM Plex Mono / Serif (superfamily) | engineered, honest |
| Manrope | geometric sans | low | high | Fraunces (display) | clean-but-friendly |
| Spline Sans | neutral sans | low | high | Spline Sans Mono | product UI, quiet |
| Instrument Serif | high-contrast display serif | very high | low | Geist / Inter | elegant hero display |
| JetBrains Mono | monospace | — | high | (data/code only) | data, terminal |
| IBM Plex Mono | monospace | — | med | (data/code only) | data, analyst |

Tabular figures: prefer faces with tabular `font-variant-numeric` support (IBM Plex,
Source Sans, JetBrains/Plex Mono) for data-dense registers — see `numerics.md`.

## Register notes (do not homogenize)
Read the active project profile FIRST; the same craft canon applies but the typeface
personality is register-specific:
- **A regulated trust portal (serious-trust):** restrained grotesque/neutral sans, optional
  transitional serif for editorial moments; NO characterful display faces, no
  rounded/playful. Mercury/Vanta/Stripe register.
- **A warm consumer app (warm-premium-fun):** humanist/rounded with a characterful display
  (e.g. Fraunces) over a friendly workhorse; delight is correct here, with
  Linear-grade discipline.
- **An analyst data product (analyst-terminal):** a real monospace for data + a dense neutral
  sans; tabular figures everywhere numbers appear; Bloomberg×Wikipedia density.

## System stacks (the legitimate default)
A metric-aware platform stack, in priority order, as the fallback or the whole
choice:

```
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             "Helvetica Neue", Arial, sans-serif;
/* mono */   ui-monospace, "SF Mono", "Cascadia Mono", "Roboto Mono",
             Menlo, Consolas, monospace;
```

Even when a web font is chosen, the system stack is the tail of the family list AND
the `local()` source for the metric-matched fallback (see `loading.md`).
