# Registers — judge against the project, never a global ideal

The council judges every candidate against the active project's REGISTER (its
intended feeling), not a universal notion of "good design". The same loud palette is
a win in one register and a defect in another. Homogenizing all projects toward one
taste is the failure mode this file prevents.

## Read the profile first

Profile resolution order: `<project>/.design/profile.json` (preferred) →
`<dataDir>/profiles/<project>.json` → bootstrap from
`${CLAUDE_PLUGIN_ROOT}/profiles/examples/example.json` (see that folder's README).

A profile carries (see the example profile for the real shape):
- `_register` — the prose statement of the intended feeling and any locked rules
  (e.g. a regulated trust portal's: "single locked teal palette … override role =
  NEUTRAL, never amber").
- `bannedClusters` — named color clusters that are auto-defects for this project
  (e.g. the generative-AI cyan `#16d5e6`/`#00d4ff`; the default AI purple→pink
  gradient). A candidate using a banned cluster loses on the Hall/Craft lenses
  regardless of other merits.
- `tokenModule` + `allowRawColorIn` — where the real tokens live and the only files
  allowed to carry raw hex; the **Token** exit test reads names from here.

If no profile exists for the project, ask for the register in one line (subject,
audience, the page's job, the feeling) before judging.

## The three reference registers (never homogenize)

| Project archetype | Register | A win looks like | A defect looks like |
|---|---|---|---|
| **A regulated trust portal** | serious-trust (legal/threshold) | calm authority; restraint; AA designed-in; protective framing in cool/neutral | spectacle; urgency colors on protective flows; soft money-green; toy-like |
| **A warm consumer app** | warm-premium-fun | inviting warmth with premium finish; personality with polish; a point of view | sterile/corporate; flat and safe; warmth that reads cheap |
| **An analyst data product** | analyst-terminal | dense, information-first; tabular precision; calm under data load | decorative chrome; low information density; consumer-app softness on a tool |

These are illustrative of HOW register changes the verdict, not an exhaustive list.
Each project's own profile is authoritative.

## How register changes each lens

- **Jobs** — "a generation ahead" means different things: for analyst-terminal it's
  density done with conviction; for warm-premium it's personality held with restraint.
- **Norman** — calm is required everywhere, but its expression differs (a terminal's
  calm is legible density; a trust app's calm is space and a serene wait state).
- **Hall** — judges AA + brand honesty against THIS brand's palette and identity
  boundaries, including the profile's banned clusters.
- **Spool** — scannability bar scales with density: a terminal can be denser before
  it's a wall-of-text; a consumer flow cannot.
- **Compliance-honesty** — the protective-color rule and honest-data rules come from
  the profile (e.g. a trust register: override = NEUTRAL, cooling-off = cool not amber).
- **Craft** — the polish ceiling is the register's: premium-warm demands warmth in
  the detail; analyst-terminal demands precision over ornament.

## In the chair's synthesis

When lenses conflict, the chair resolves toward the REGISTER, citing it explicitly:
"Jobs wants the louder hero; the serious-trust register favors Norman's calmer
frame, so the winning frame is B with A's hero headline grafted at reduced scale."
Always name the register in a conflict resolution — never average two directions
into a compromise that fits neither.

Discipline is not the register. "Restraint", "calm", "decluttered", "receded
chrome" are DISCIPLINE qualities — the diagnosis a redesign must satisfy. They are
NOT a substitute for the register's named feeling. For a warm-premium-fun register,
executing Linear-grade discipline is the CONSTRAINT; warmth/play/color/character is
the PERSONALITY. A synthesis that crowns the most disciplined direction while
LOWERING warmth has optimized the constraint and lost the product. When the
diagnosis (less clutter) and the register (more warmth) appear to conflict, they do
not: satisfy the diagnosis as a floor, then maximize the register on top of it —
never spend the register to buy more discipline.
