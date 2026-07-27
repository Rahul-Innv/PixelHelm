#!/usr/bin/env python3
"""E3 panel aggregation, exactly as pre-registered (PREREG-RUBRIC-commerce.md):
per-criterion score = median of the 5 jurors; overall = median of the 10
criterion medians; no means, no weights. De-blinds candidate labels via the
seeded blind map. Winner = arm with the highest overall median (the tournament
verdict the PASS bar applies to). PASS iff every criterion median >= 6 AND
overall median >= 8 (gate precondition recorded separately). Amendment C1
(owner-approved, pre-generation): any criterion or overall median of 9+ is
recorded as "strong, owner-verify" — never as achieved distinctive
excellence; the owner's verification pass is the binding read at the top of
the scale."""
import json
from statistics import median
from pathlib import Path

base = Path(__file__).parent
m = json.load(open(base / "blind-map.json"))
jurors = {k: json.load(open(base / "raw" / f"juror-{k}.json")) for k in range(1, 6)}

# de-blind: juror k's candidate-i == armOrder[i-1] for that juror
scores = {}  # arm -> criterion -> [5 scores]
for k in range(1, 6):
    order = m["jurors"][f"juror-{k}"]["armOrder"]
    for i, arm in enumerate(order, 1):
        cand = jurors[k]["candidates"][f"candidate-{i}"]["criteria"]
        for c in map(str, range(1, 11)):
            scores.setdefault(arm, {}).setdefault(c, []).append(int(cand[c]["score"]))

out = {
    "aggregation": "per-criterion median of 5 jurors; overall = median of the 10 criterion medians (registered)",
    "amendmentC1": "9+ medians are recorded as strong-owner-verify (never achieved distinctive excellence); the owner's verification pass is the binding read at the top of the scale",
    "arms": {},
}
for arm, crit in scores.items():
    medians = {c: median(v) for c, v in sorted(crit.items(), key=lambda kv: int(kv[0]))}
    overall = median(list(medians.values()))
    out["arms"][arm] = {
        "criterionScores": {c: sorted(v) for c, v in sorted(crit.items(), key=lambda kv: int(kv[0]))},
        "criterionMedians": medians,
        "overallMedian": overall,
        "minCriterionMedian": min(medians.values()),
        "strongOwnerVerifySignals_C1": [c for c, v in medians.items() if v >= 9],
    }
ranked = sorted(out["arms"].items(), key=lambda kv: kv[1]["overallMedian"], reverse=True)
out["ranking"] = [{"arm": a, "overallMedian": d["overallMedian"]} for a, d in ranked]
top = ranked[0][1]["overallMedian"]
tied = [a for a, d in ranked if d["overallMedian"] == top]
out["winner"] = tied[0] if len(tied) == 1 else {"tie": tied}
if len(tied) == 1:
    w = out["arms"][tied[0]]
    out["passBar"] = {
        "clause1_gates": "all shipped HARD gates green x3 arms x2 surfaces + 4/4 mutant ritual recorded (see project/gates + honesty/mutant-ritual)",
        "clause2_noCriterionMedianBelow6": w["minCriterionMedian"] >= 6,
        "minCriterionMedian": w["minCriterionMedian"],
        "clause3_overallMedianAtLeast8": w["overallMedian"] >= 8,
        "overallMedian": w["overallMedian"],
        "PASS": w["minCriterionMedian"] >= 6 and w["overallMedian"] >= 8,
    }
print(json.dumps(out, indent=2))
