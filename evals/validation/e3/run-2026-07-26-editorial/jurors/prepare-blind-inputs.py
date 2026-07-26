#!/usr/bin/env python3
"""E3 editorial panel prep — deterministic blind inputs.

Writes jurors/blind-map.json (seeded per-juror arm shuffles), one
juror-K-inputs.md per juror (candidate briefs under neutral labels, in that
juror's order: frozen intent + A1 declared breaks + machine-gate outcome), and
copies the render matrix into a per-juror scratch directory under neutral
candidate names (arm filenames would unblind the panel; the scratch copies are
byte-copies of the committed renders and are not committed themselves).

Usage: python prepare-blind-inputs.py <scratch-blind-dir>
"""
import json, random, shutil, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parent / "project"
ARMS = ["almanac-rail", "weir-plates", "two-inks"]
SEED_BASE = 202607560  # E3-editorial juror seed family (E1 used 202607460+)

INTENTS = {
    "almanac-rail": "A parish almanac read top to bottom: every year since 1990 is one ruled line whose rain marks sit on a fixed September-to-October shelf, so the eye watches the wet season walk later down the page while the entries grow heavier.",
    "weir-plates": "Three patient broadsheet plates — when the rain comes, how much falls, how hard the worst day hits — each annotated in the reporter's own words, with the prose walking the reader from plate to plate.",
    "two-inks": "Two inks for two instruments: the manual-gauge years print in umber, the weir years in river blue, and the whole story — later, harder — is read by watching where the blue marks drift away from the umber ones.",
}
BREAKS = {
    "almanac-rail": [
        "The year-list IS the only chart — no separate hero graphic; the almanac rail (34 ruled year-rows, onset mark on a shared calendar shelf, season-total bar, heaviest-day figure) carries the entire quantitative story (in an almanac the record itself is the reading matter; splitting chart from table would make the data decoration).",
        "Editorial interjections interrupt the record — the rail breaks at the decade turns, the gaps, the method change, and 2019 for short prose asides, so caveats and story live inside the record, not in footnotes (the local paper's patience made visible).",
    ],
    "weir-plates": [
        "The journalism is written on the plates — annotations (the method change, the gaps, the 2019 flag, the era means) are keyed directly to each chart plate instead of a separate caption column (if every device must trace to the reporting, the strongest form is reporting inked onto the graphic itself).",
        "The grid is suppressed except where the story points — each plate draws only the reference lines its annotations name (era means, calendar shelf, gap markers), not a full axis lattice (a patient local paper prints nothing it does not need).",
    ],
    "two-inks": [
        "The method-change disclosure is promoted to the page's color system — every data mark, figure, and era label is inked by instrument (umber = manual gauge 1990-1996, blue = automated weir 1997-2023), never by color alone (era names written out at every crossing) — the data-integrity caveat becomes the brand layer.",
        "The finding leads; the record follows — the page opens with a facing then/now diptych (early manual-gauge era beside the recent verified weir years) before any time series, breaking the chronological-first convention (the reader's question is answered first; the 34-year evidence is laid out underneath for checking).",
    ],
}
GATE_LINE = (
    "All shipped machine gates GREEN for this candidate: token-contract AA recompute "
    "(text>=4.5, graphic>=3.0, light+dark); structural output floor (single main, h1, heading "
    "order, meta description); axe-core 0 serious / 0 critical on all 4 rendered cells; no "
    "horizontal overflow at 280/320/414px; state-aware contrast (default/hover/focus, both "
    "modes) pass; target-size (WCAG 2.5.8) pass; focus-trap not-applicable (no dialog); "
    "derived-claims honesty gate pass (34 year blocks scoped, both modes); required-content "
    "manifest pass (17 items, both modes). Mode fidelity verified ok for light and dark renders."
)
CELLS = ["desktop__light", "desktop__dark", "mobile__light", "mobile__dark"]


def main(blind_root: Path) -> None:
    jurors = {}
    for k in range(1, 6):
        rng = random.Random(SEED_BASE + k)
        order = ARMS[:]
        rng.shuffle(order)
        jurors[f"juror-{k}"] = {"jurorSeed": SEED_BASE + k, "armOrder": order}
    (HERE / "blind-map.json").write_text(
        json.dumps({"armOrderBase": ARMS, "jurors": jurors}, indent=2) + "\n", encoding="utf-8")

    for k in range(1, 6):
        order = jurors[f"juror-{k}"]["armOrder"]
        lines = ["# Candidate briefs (neutral labels; order fixed for you)\n"]
        jdir = blind_root / f"juror-{k}"
        jdir.mkdir(parents=True, exist_ok=True)
        for i, arm in enumerate(order, 1):
            lines.append(f"\n## candidate-{i}\n")
            lines.append(f'\nDirection intent (written before any code existed): "{INTENTS[arm]}"\n')
            lines.append(
                "\nDeclared convention breaks (per the pre-registration's Amendment A1, these and ONLY "
                "these are the candidate's deliberate breaks; any other convention break you find is "
                "undeclared and scores as a mistake, not a signature):")
            for b in BREAKS[arm]:
                lines.append(f"\n- {b}")
            lines.append(f"\n\nMachine-gate outcome: {GATE_LINE}\n")
            for cell in CELLS:
                shutil.copyfile(PROJECT / "renders" / f"{arm}__{cell}.png",
                                jdir / f"candidate-{i}__{cell}.png")
        (HERE / f"juror-{k}-inputs.md").write_text("".join(lines), encoding="utf-8")
    print("blind-map.json + 5 inputs files written; blind renders under", blind_root)


if __name__ == "__main__":
    main(Path(sys.argv[1]))
