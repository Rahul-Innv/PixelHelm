# STORM × design — the research engine + the DESIGN adapter

STORM is a portable, **perspective-guided, source-grounded, claim-verified research engine**. Given a
subject it runs many non-overlapping personas that interrogate it, an "expert" answers **grounded only in
fetched sources**, every load-bearing inference is surfaced as a typed claim, each claim is **verified at
the claim level**, and the output is a **verified multi-section dossier** that abstains honestly when
evidence is thin.

For **front-end design**: STORM produces a **verified design *brief*** — grounded, cited design
recommendations per dimension, with confidence + honest abstains — **NOT UI**. The design skill turns the
brief into pixels as a *separate* step. (If you expected STORM to emit UI, it's the wrong layer.)

## Layout

```
storm/
  storm_engine/        # the portable engine, COPIED VERBATIM — DO NOT MODIFY (5 files + __init__)
                       #   contracts.py (data model + the 3 Protocols) · perspective.py (Part 1) ·
                       #   conversation.py (Part 2 loop) · writer.py (surface + anti-evasion) · gate.py
  design_adapter/      # THIS project's adapter — the only thing a new domain writes
    framework.py       #   DesignFramework  (FrameworkSpec):  6 design dims + basic-fact + refuter
    retrieval.py       #   DesignRetrieval  (RetrievalAdapter): local design-KB / WCAG / reference corpus
    gate.py            #   DesignGate + DesignVerify (VerificationGate): entailment + self-consistency
    roles.py           #   DesignInterrogator / DesignExpert / DesignInferenceSurfacer (the 3 LLM roles)
    llm.py             #   DesignLLM  (Anthropic client + ledger; latest Claude models)
    stubs.py           #   deterministic OFFLINE stand-ins (the gate-proof scenario)
    provider.py        #   StormDesignProvider — ties Part 1 + Part 2 into brief()
  demo_offline.py      # end-to-end offline proof (no network) — run this first
```

## Run the offline proof (no API, no network)

```
cd .../frontend-design-skill/storm
python -m compileall storm_engine design_adapter   # both compile clean
python demo_offline.py                              # exits 0 on PASS
```

Proves: over-association is surfaced **and** structurally caught, a lens **abstains** on unsupported
evidence, the refuter **contests + floors** a lens, and **flag-only keeps** the flagged leap while
**strict-drop removes** it.

## Run it live

```python
from design_adapter import (DesignFramework, DesignRetrieval, DesignGate, DesignVerify,
                            DesignInterrogator, DesignExpert, DesignInferenceSurfacer,
                            DesignLLM, Ledger, StormDesignProvider)

ledger = Ledger()
conv  = DesignLLM("sonnet", ledger=ledger)   # interrogator + expert + surfacer (cheaper is fine)
judge = DesignLLM("opus",   ledger=ledger)    # the entailment judge (keep it strong)

# corpus = the design KB + WCAG + this project's design-system / reference docs:
retrieval = DesignRetrieval.default_design_kb(extra=[
    {"url": "C:/.../project/DESIGN.md", "channel": "design_system", "title": "Project DESIGN",
     "tags": "tokens register components contracts"},
    {"url": "C:/.../your-project/.design/references.md", "channel": "reference",
     "title": "North-stars", "tags": "reference ui inspiration"},
])

subject = {"name": "Your surface", "description": "<the job-to-be-done, register, current UI, states>"}

prov = StormDesignProvider(
    framework=DesignFramework(),
    retrieval=retrieval,
    interrogator=DesignInterrogator(conv),
    expert=DesignExpert(conv, subject, context="<optional rendered-baseline description>"),
    surfacer=DesignInferenceSurfacer(conv),
    gate=DesignGate(DesignVerify(judge, retrieval.read)),  # read_source re-reads cited files
    k_runs=2, max_turns=3, strict_drop=False,               # FLAG-ONLY (see "Validation status")
)
brief = prov.brief(subject)   # -> verified design brief (dict); feed to the design skill's generate step
```

Auth: `DesignLLM` uses `anthropic.Anthropic()`, resolving `ANTHROPIC_API_KEY` / `ANTHROPIC_AUTH_TOKEN` /
an `ant auth login` profile. Models (2026-07): `opus=claude-opus-4-8`, `sonnet=claude-sonnet-4-6`,
`haiku=claude-haiku-4-5`. `effort` is gated per model (Haiku rejects it).

## The contract (the entire API surface)

Three adapter Protocols + three injected LLM roles (`storm_engine/contracts.py`, `conversation.py`,
`writer.py`). The claim model is typed `fact | relational | evaluative`; `relational`/`evaluative` are the
**over-association surface** — the gate verifies the **full proposition**, never a sub-span. A relational
claim with no citation tagged `supports:"link"` is **structurally unsupported** (judge-independent).

- **Entailment axis (design):** *"is this design claim grounded in a cited principle / reference /
  standard?"* — the judge re-reads the cited local file and rules supported / unsupported / unclear on the
  whole claim.

## Inherited quality rules (kept — they ARE the quality)

- Every run includes an **adversarial refuter** + a **basic-fact baseline**.
- **Self-consistency is mandatory** (claims must recur across K runs).
- **silence != absence** — an absent/unreadable source lowers confidence, never fabricates.
- Sections **abstain** (`insufficient_evidence`, confidence `None`) when no supported claim survives.
- A supported **refuter claim contests** a section and **floors** its confidence (never a mushy average).
- **`strict_drop` is flag-only until earned** on a hand-rated gold set — do not assume it. For design this
  is fine (design research is low-stakes); `corroboration` returns `None` → the **2-tier gate**.

## Validation status (honest)

Engine + method are **verified offline**: the copied engine compiles + imports; **`demo_offline.py` AND
`demo_live_shape.py` both PASS** (the latter drives the real roles via a fake Anthropic client). An
**adversarial verification pass** (3 skeptics) found 0 blockers and 8 adapter-side issues, all fixed +
re-verified; 5 engine-owned root causes are recorded as upstream coordination items (see the backlog
§5b). The strict-drop precision gate was **never cleared on the paid API** (upstream), so **run flag-only**
and earn strict-drop later on a design gold set if you want it. The **paid-API live run** is still pending.

## Ownership / coordination

The **engine is OWNED UPSTREAM** (a sibling research project by the same author); we consume a
**copy** in `storm_engine/`. **Do not fork or modify the engine** — if you hit an engine bug or need a
contract change, raise it back to the upstream engine project so both adapters stay in sync.

**Promote candidate:** `design_adapter/provider.py` (`StormDesignProvider`) imports **only** from the
engine — its control flow is a near-identical twin of the reference `adapter/provider.py`. Flag it to the
upstream engine owner as a candidate to **promote into the engine** so both adapters share one orchestrator.

## Design decisions (the non-obvious ones)

- **Local-file grounding.** The design corpus is local files (KB + WCAG + design-system + reference
  notes), not the web — confidential design research needs no network, matching the engine's firewall.
- **Perspective id ≠ lens key (gotcha).** The engine derives a perspective's id from the anchor's *family
  slug* (`"Conversion & UX — …"` → `conversion___ux`), which is **not** the lens key (`conversion_ux`).
  Roles must switch on `perspective.anchor_keys`, not `perspective.id`. (The live `DesignExpert` already
  does; the stub was fixed to match.)
