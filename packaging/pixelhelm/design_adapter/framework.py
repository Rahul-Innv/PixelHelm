"""
design_adapter/framework.py — the DESIGN FrameworkSpec (Part 1 input to the STORM engine).

The design domain's analytical taxonomy: six design dimensions become framework `angles()`, plus the
mandatory "+1" basic-fact baseline and the pinned adversarial REFUTER (a usability/heuristic critic —
the bear-case that the design FAILS its users). The engine's Perspective Designer groups angles by
framework-section FAMILY (text before the first em/en-dash); each dimension gets a DISTINCT family so
it becomes its own perspective (6 constructive perspectives + basic-fact + refuter = 8).

Anchor strings double as the design-system section each angle maps to. anchor_keys become the lens keys
of the output brief's sections. The refuter owns `usability_risks` and (expanded by the engine) contests
every constructive lens.
"""
from __future__ import annotations

from ..storm_engine.contracts import Angle

# The refuter owns risk analysis — it is NOT a constructive family persona (excluded from framework angles).
_REFUTER_OWNED = ("usability_risks",)

# ---- shared, cross-cutting rubrics the panel can cite (thresholds live here, cited by claims) --------
WCAG_RUBRIC = {
    "levels": {"A": "must", "AA": "target (the contract)", "AAA": "aspire"},
    "contrast": "text 4.5:1 / large 3:1 (>=24px or 18.66px bold) / UI+focus 3:1 — WCAG 2.2, no rounding",
    "targets": "pointer target >= 24x24 CSS px (WCAG 2.5.8); 44px is AAA/HIG",
    "motion": "reduced-motion VARIANT (cross-fade, not kill); <=3 flashes/s; pause/stop/hide >5s",
    "rule": "cite the specific success criterion; an untested contrast/label claim is unsupported.",
}
CWV_RUBRIC = {
    "thresholds": "LCP <=2.5s / INP <=200ms / CLS <=0.1 at p75",
    "rule": "reserve media/font dimensions; a perf claim needs a measured or cited basis, not a guess.",
}
HEURISTICS_RUBRIC = {
    "set": "Nielsen 10 + Norman affordance/signifier/feedback + Laws-of-UX (Hick, Fitts, Miller)",
    "rule": "name the heuristic and tie the finding to it; 'looks off' is not a finding.",
}

# ---- the six design-dimension angles (each a distinct family -> its own perspective) -----------------
_ANGLES = [
    Angle(
        id="accessibility",
        title="Accessibility & inclusive-interaction analyst",
        anchor="Accessibility — WCAG 2.2 conformance & inclusive interaction",
        question=("Where does this design meet or fail WCAG 2.2 AA — contrast, keyboard operability, "
                  "focus order/visibility, semantics/labels, target size, reduced-motion — and what is "
                  "the specific criterion for each finding?"),
        kind="framework",
        rubric=("Cite the specific WCAG success criterion + threshold for each finding (see the wcag "
                "shared rubric). Contrast/label/target claims must reference a computed value or a "
                "cited standard, never a guess."),
        anchor_keys=("accessibility",),
    ),
    Angle(
        id="visual_brand",
        title="Visual & brand craft analyst",
        anchor="Visual brand — hierarchy, typography, color, restraint",  # family slugs to lens key
        question=("Does the visual system establish a clear hierarchy and a coherent, on-register brand "
                  "voice — typographic scale, color/restraint, spacing rhythm, one signature — and where "
                  "does it read generic, cluttered, or off-register?"),
        kind="framework",
        rubric=("Ground each judgment in a cited craft principle or the project's own register/tokens; "
                "prefer positive distinctiveness derived from the brand over a generic 'clean' ideal."),
        anchor_keys=("visual_brand",),
    ),
    Angle(
        id="information_architecture",
        title="Information-architecture analyst",
        anchor="Information architecture — navigation, findability, labeling",
        question=("Is the content structured so users can find and understand what they need — navigation "
                  "model, grouping, labeling, progressive disclosure — and where do labels, depth, or "
                  "ordering create confusion?"),
        kind="framework",
        rubric=("Tie findings to an IA/labeling principle (Hick's law, recognition-over-recall, plain "
                "language); cite the reference or the project's IA docs."),
        anchor_keys=("information_architecture",),
    ),
    Angle(
        id="conversion_ux",
        title="Conversion & interaction (UX) analyst",
        anchor="Conversion UX — task flow, friction, affordance honesty",  # family slugs to lens key
        question=("For the primary job-to-be-done, where is friction, ambiguity, or a dishonest "
                  "affordance in the task flow — steps, defaults, states (empty/loading/error), "
                  "feedback — and what raises or lowers completion?"),
        kind="framework",
        rubric=("Map each finding to a usability heuristic (Nielsen/Norman) or a cited flow principle; "
                "affordance-honesty issues (a control that lies about what it does) are high severity."),
        anchor_keys=("conversion_ux",),
    ),
    Angle(
        id="responsive",
        title="Responsive & mobile analyst",
        anchor="Responsive — breakpoints, mobile, touch targets, zoom",  # family slugs to lens key
        question=("Does the layout hold across breakpoints and inputs — no overflow/overlap, >=24px "
                  "touch targets, survives 200% zoom + 1.4.10 reflow, longest real copy — and where does "
                  "it break on small/large viewports?"),
        kind="framework",
        rubric=("Cite the responsive/target/zoom criterion (WCAG 1.4.10 reflow, 2.5.8 target size); a "
                "layout claim must reference the breakpoint and the real content width."),
        anchor_keys=("responsive",),
    ),
    Angle(
        id="performance",
        title="Front-end performance analyst",
        anchor="Performance — Core Web Vitals, asset weight, perceived speed",
        question=("Where does the design threaten Core Web Vitals or perceived speed — LCP element, "
                  "layout-shift sources, asset/font weight, blocking work, reserved dimensions — and "
                  "what is the cited threshold or measured basis?"),
        kind="framework",
        rubric=("Cite the CWV threshold (see the cwv shared rubric); a performance claim needs a "
                "measured number or a cited web-performance principle, not an assertion."),
        anchor_keys=("performance",),
    ),
]

_BASIC_FACT = Angle(
    id="basic_fact",
    title="Design-subject desk researcher",
    anchor="Design subject — what this product/page/flow is",
    question=("What is this product/page/flow, verifiably: its primary job-to-be-done, its intended "
              "users, its register/brand, its stated constraints, and what the current UI actually "
              "contains (surfaces, key components, states)?"),
    kind="basic_fact",
    rubric=("NEUTRAL, VERIFIABLE description grounded in the provided subject brief / design-system "
            "docs. No recommendations here — establish the ground truth the other lenses build on."),
    anchor_keys=("subject",),  # owns the shipped "subject" baseline section (ground truth the lenses build on)
)

_REFUTER = Angle(
    id="refuter",
    title="Adversarial usability critic (bear-case)",
    anchor="Usability risk — the strongest evidenced case this design fails its users",
    question=("What is the strongest EVIDENCED case that this design fails its users? Sweep the heuristic "
              "set and the a11y/perf floors for the highest-severity, load-bearing failures — including a "
              "'silent killer' (a risk both unaddressed AND unowned by any constructive lens)."),
    kind="refuter",
    rubric=("Attack the DESIGN, PATTERNS, and DECISIONS — never a named person. Map each risk to a cited "
            "heuristic or standard (see the heuristics/wcag/cwv shared rubrics); an unfounded 'this is "
            "bad' is not a refutation."),
    anchor_keys=_REFUTER_OWNED,  # owns usability_risks; contests every other lens (expanded by the designer)
)


class DesignFramework:
    """FrameworkSpec over the six design dimensions (+ the adapter's basic-fact + refuter floor)."""

    def framework_id(self) -> str:
        return "design-brief-v1"

    def angles(self) -> list:
        return list(_ANGLES)

    def shared_rubrics(self) -> dict:
        return {"wcag": WCAG_RUBRIC, "cwv": CWV_RUBRIC, "heuristics": HEURISTICS_RUBRIC}

    def basic_fact_angle(self) -> Angle:
        return _BASIC_FACT

    def archetype_floor(self) -> list:
        return [_BASIC_FACT, _REFUTER]
