#!/usr/bin/env python3
"""Deterministic outcome oracle for PixelHelm atomic-trigger qualification."""

from __future__ import annotations

import re
from typing import Any


FLAGS = re.IGNORECASE | re.DOTALL

# These rules encode outcome boundaries, not skill names or fixture IDs. A request
# matching zero outcomes is rejected; a request matching more than one is an
# explicit semantic collision and is rejected rather than resolved by ordering.
RULES: dict[str, tuple[str, ...]] = {
    "pixelhelm": (r"\broute\b.*\b(?:right|appropriate) design steps\b",),
    "pixelhelm-choicegate": (r"\bverify\b.*\bcomplete choicegate continuation\b",),
    "pixelhelm-loop": (r"\bfull bounded design loop\b",),
    "pixelhelm-ground": (r"\bresolve\b.*\bregister\b.*\btoken contract\b.*\bguidance\b.*\blessons\b",),
    "pixelhelm-baseline": (r"\bcapture\b.*\bincumbent\b.*\bbefore redesign",),
    "pixelhelm-generate": (r"\balready selected\b.*\bdirection\b.*\bimplementation candidates?\b",),
    "pixelhelm-render": (r"\brender\b.*\bbrowser\b.*\bmobile\b.*\bdesktop\b.*\blight\b.*\bdark\b",),
    "pixelhelm-evaluate": (r"\bmachine-certain\b.*\b(?:accessibility|token)\b.*\bgates?\b",),
    "pixelhelm-judge": (r"\bcompare\b.*\brendered candidates\b.*\bexpert lenses\b",),
    "pixelhelm-repair": (r"\bfix only\b.*\bvalidated\b.*\bfinding\b.*\brerender\b.*\brecheck\b",),
    "pixelhelm-tokens": (r"\bcanonical token module\b.*\bdrift guard\b.*\bconformance tests?\b",),
    "pixelhelm-promote-design": (r"\bowner-approved\b.*\bpassing candidate\b.*\bauthorized local target\b",),
    "pixelhelm-record-lesson": (r"\brecord\b.*\bowner(?:'s)? correction\b.*\bversioned design lesson\b",),
    "pixelhelm-refresh-guidance": (r"\brefresh\b.*\bstale\b.*\b(?:guidance|accessibility-method)\b.*\bauthorized evidence\b",),
    "pixelhelm-curate-fingerprints": (r"\bvalidated recurring\b.*\bfingerprint registry\b",),
    "pixelhelm-reference": (r"\bfind\b.*\bui precedents\b.*\bbefore direction work\b",),
    "pixelhelm-directions": (r"\bthrowaway direction mockups\b.*\bowner\b.*\bchoose\b",),
    "pixelhelm-evidence-brief": (r"\bcited\b.*\bconfidence-labeled\b.*\bevidence brief\b",),
    "pixelhelm-color": (r"\bsemantic color roles\b.*\bexisting token contract\b",),
    "pixelhelm-typography": (r"\bresponsive type scale\b.*\bfont loading\b.*\bnumeric behavior\b",),
    "pixelhelm-motion": (r"\btransition tokens\b.*\breduced-motion equivalents\b",),
    "pixelhelm-dataviz": (r"\buncertainty chart\b.*\bhonest axes\b.*\bnumeric rails\b",),
    "pixelhelm-content": (r"\berror messages\b.*\bempty states\b.*\bproduct register\b",),
    "pixelhelm-email": (r"\btransactional html email\b.*\bmajor-client rendering\b",),
    "pixelhelm-video-placement": (r"\bpre-rendered product video placement\b.*\bcaptions\b.*\bfallback\b",),
}


def route_prompt(prompt: str) -> dict[str, Any]:
    if not isinstance(prompt, str) or not prompt.strip():
        return {
            "route_type": "no-safe-route",
            "leaf_id": None,
            "reason": "empty-or-invalid-prompt",
            "matched_leaf_ids": [],
        }
    matched = sorted(
        skill
        for skill, patterns in RULES.items()
        if any(re.search(pattern, prompt, FLAGS) for pattern in patterns)
    )
    if len(matched) == 1:
        return {
            "route_type": "atomic-leaf",
            "leaf_id": matched[0],
            "reason": "single-outcome-match",
            "matched_leaf_ids": matched,
        }
    return {
        "route_type": "no-safe-route",
        "leaf_id": None,
        "reason": "no-outcome-match" if not matched else "ambiguous-outcome-collision",
        "matched_leaf_ids": matched,
    }
