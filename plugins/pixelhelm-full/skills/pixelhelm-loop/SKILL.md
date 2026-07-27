---
name: pixelhelm-loop
description: Run the bounded end-to-end PixelHelm design loop after routing. Use when an admitted UI task needs grounding, baseline, generation, browser rendering, evaluation, judgment, targeted repair, and owner closeout in sequence. Do not use for a single named leaf or for unadmitted work.
---

# PixelHelm loop

Read each selected leaf from disk and keep its seam intact. Ground before taste or
code. Capture the incumbent. Render before evaluation. Machine failures and blockers
may trigger one targeted repair and recheck; advisory scores alone may not. Cap the
repair loop at three rounds. Promotion remains a separate owner-gated leaf.

Capture the incumbent's gate results and key measurements through
pixelhelm-baseline's scripts/baseline.mjs, and compare every candidate against that
baseline before judging it. A gate that passed at the baseline and fails now is a
Blocker regardless of the candidate's own machine pass; a gate that stopped being
measured is never a pass. Never absorb a change into the baseline — an intended
change is proposed for the owner, never written in place.

Close every pass by writing the sign-off and run records through scripts/records.mjs
(validate-then-write, append-only), then append the pass's capability-ledger entry
through scripts/capability-ledger.mjs and run its check. Do not report a pass
complete before its records exist; a refused write, or a check that finds a run with
no ledger line, is a blocking finding. Fields the pass did not measure are recorded
unknown, never reconstructed.
