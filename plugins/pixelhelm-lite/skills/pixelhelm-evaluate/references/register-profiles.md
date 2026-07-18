# Register profiles — never homogenize

> ToC: [Why the register matters](#why-the-register-matters) · [Where profiles live](#where-profiles-live)
> · [Profile shape](#profile-shape) · [How the register changes findings](#how-the-register-changes-findings)
> · [The named registers](#the-named-registers)

## Why the register matters

A finding is only valid relative to the project's intended REGISTER. The same saturated palette is
a Blocker on a serious-trust enterprise product and a SUCCESS on a warm-fun consumer brand. The
false-positive filter's "bold choice working as intended" rule depends on knowing the register.
Homogenizing every project to one neutral "tasteful" look manufactures the exact AI-slop the plugin
fights. **Load the profile first; let it decide what "good" means here.**

## Where profiles live

Resolution order: `<project>/.pixelhelm/profile.json` (preferred) →
`<dataDir>/profiles/<project>.json` → bootstrap from
`${CLAUDE_PLUGIN_ROOT}/profiles/examples/example.json` (store map: the `pixelhelm`
skill's `references/close-the-loop.md`). Resolve the active project from the
working directory / the router's
context. If no profile matches, ask which register applies rather than assuming neutral.

## Profile shape

(A real profile shape, from a regulated trust portal.)

```json
{
  "project": "trust-portal",
  "tokenModule": "src/lib/tokens.mjs",
  "sourceDirs": ["src"],
  "allowRawColorIn": ["src/lib/tokens.mjs", "src/app/globals.css"],
  "bannedClusters": [
    { "id": "ai-cyan", "any": ["#16d5e6", "#00d4ff"], "note": "the over-used generative-AI cyan fingerprint" },
    { "id": "ai-purple-grad", "any": ["from-purple-500 to-pink-500"], "note": "the default AI purple->pink gradient" }
  ],
  "_register": "Single locked teal palette; operator app serious-trust; candidate portal CALM. override role = NEUTRAL (never amber)."
}
```

- `tokenModule` — the AA source of truth Layer-1 contrast reuses (the example module exports
  `evaluateGatedPairs` + scales; call it, do not re-derive pairs).
- `allowRawColorIn` — the only files allowed to carry raw hex (the token source + the generated
  globals.css token block). Raw color anywhere else is a finding.
- `bannedClusters` — hex/class fingerprints that are an automatic finding REGARDLESS of register
  (the AI tells). Flag any match.
- `_register` — the prose intent that decides taste-level PASS/FAIL and arms the false-positive
  filter.

## How the register changes findings

- **What's a Blocker vs a success.** A dramatic type scale or saturated accent is a Blocker on a
  restrained register and an intended success on a bold one — apply the false-positive filter
  through the register's lens.
- **What's "timid."** A muted palette PASSES a calm/serious register but may be a "timid palette"
  Blocker on a fun/premium register that's supposed to feel distinctive.
- **Banned clusters are register-independent.** AI-cyan and the purple→pink gradient fail
  everywhere — they are tells, not taste.
- **Layer-1 is register-INDEPENDENT.** Contrast/a11y/conformance are constants; the register never
  loosens a machine gate. Only Layer-2 judgment is register-relative.

## The named registers

Profiles encode distinct registers — never collapse them:

- **A warm consumer app** — warm / premium / fun. Distinctiveness expected; timid palettes are findings.
- **A regulated trust portal** — serious / trust. Restraint expected; loud unmotivated color is a finding; override
  role is NEUTRAL, never amber.
- **An analyst data product** — analyst / terminal. Dense, instrument-panel; editorial 1.2+ type ratios and
  generous whitespace may be WRONG here (data density is the point).

Distinctiveness is SUBJECT-derived (tournament + north-star), never preset-picked — reject any urge
to grade toward a single house style.
