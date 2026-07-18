"""
storm/engine/perspective.py — Part 1: the Perspective Designer (PORTABLE, zero upstream-project imports).

Turns a FrameworkSpec into a de-duplicated PerspectiveSet:
  - framework angles are grouped by their framework-section FAMILY (the text before the first em/en-dash),
    so overlapping angles (e.g. competitors + Porter's Five Forces) collapse into ONE coherent analyst —
    the de-dup step STORM omits;
  - the archetype floor (the mandatory "+1" basic-fact baseline and the adversarial refuter) is PINNED:
    basic-fact first, refuter last, never merged out;
  - the refuter's anchor_keys are expanded to contest every framework lens.

Deterministic + pure (sorted/insertion-ordered, no RNG) so the same FrameworkSpec yields the same set.
"""
from __future__ import annotations

from collections import OrderedDict

from .contracts import Angle, FrameworkSpec, Perspective, PerspectiveSet

_SEPARATORS = ("—", "–", " - ")  # em-dash, en-dash, " - "


def family_of(anchor: str) -> str:
    """The framework-section family: the text before the first separator (else the whole anchor)."""
    for sep in _SEPARATORS:
        if sep in anchor:
            return anchor.split(sep)[0].strip()
    return anchor.strip()


def _slug(text: str) -> str:
    return "".join(c.lower() if c.isalnum() else "_" for c in text).strip("_") or "x"


def design_perspectives(spec: FrameworkSpec) -> PerspectiveSet:
    framework_angles = [a for a in spec.angles() if a.kind == "framework"]
    floor = spec.archetype_floor()
    basics = [a for a in floor if a.kind == "basic_fact"]
    refuters = [a for a in floor if a.kind == "refuter"]

    perspectives: list[Perspective] = []

    # 1) pinned "+1" basic-fact baseline (first)
    for a in basics:
        perspectives.append(Perspective(
            id=a.id, persona=a.title, anchor=a.anchor, kind="basic_fact",
            seed_questions=(a.question,), rubric=a.rubric, anchor_keys=a.anchor_keys,
            stance="constructive"))

    # 2) framework personas, grouped by framework-section family (the de-dup step)
    groups: "OrderedDict[str, list[Angle]]" = OrderedDict()
    for a in framework_angles:
        groups.setdefault(family_of(a.anchor), []).append(a)
    for family, angles in groups.items():
        keys = tuple(dict.fromkeys(k for a in angles for k in (a.anchor_keys or (a.id,))))
        rubric = " | ".join(r for r in (a.rubric for a in angles) if r) or None
        perspectives.append(Perspective(
            id=_slug(family), persona=f"{family} analyst", anchor=family, kind="framework",
            seed_questions=tuple(a.question for a in angles), rubric=rubric,
            anchor_keys=keys, stance="constructive"))

    # 3) pinned refuter (last) — owns its anchor_keys AND contests every framework lens
    all_keys = tuple(dict.fromkeys(k for a in framework_angles for k in (a.anchor_keys or (a.id,))))
    for a in refuters:
        perspectives.append(Perspective(
            id=a.id, persona=a.title, anchor=a.anchor, kind="refuter",
            seed_questions=(a.question,), rubric=a.rubric,
            anchor_keys=tuple(dict.fromkeys(a.anchor_keys + all_keys)), stance="disconfirming"))

    return PerspectiveSet(framework_id=spec.framework_id(),
                          perspectives=tuple(perspectives),
                          shared_rubrics=spec.shared_rubrics())
