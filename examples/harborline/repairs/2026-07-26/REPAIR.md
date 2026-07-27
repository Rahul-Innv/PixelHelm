# Harborline repair pass — 2026-07-26 (clearing the committed gate FAILs through the loop)

A `pixelhelm-repair` pass on `../../status-page.html`, the loop's committed output.
Scope: exactly the three honestly-committed gate FAILs in `../../gates/` — nothing
else. Method law binds: every claim below carries its artifact; the regenerated gate
records in `../../gates/` are the oracle, and any FAIL that survives the pass stays
committed honestly.

## Admission

ChoiceGate continuation admitted against the re-accepted v0.2.1 authority before any
repair work: `admitted: true`, family `pixelhelm-family`, edition `pixelhelm-lite`,
surface `claude-code` (`admission/`, sha256 `56c8354d…86b361`). Same accepted roots
as the E1 run (`evals/validation/reacceptance-2026-07-26/RECORD.md`); new request id
`pixelhelm-harborline-repair-2026-07-26`.

## Findings in, per the repair recipe (severity order; all three are Layer-1)

| # | Finding (committed evidence) | Classification | Edit applied | Verified |
|---|---|---|---|---|
| 1 | `output-floor-gate.json` FAIL: no `<main>` landmark; 2 styled-div `.section-title` heading impostors; no meta description | Surgical (missing pieces; the page's structure decisions were already made) | `<header class="header">` / `<main>` / `<footer class="footer">` landmarks; both `.section-title` divs → `<h2 class="section-title">` (class styling preserved — identical rendered pixels); honest `<meta name="description">` naming the sample-data status board | PASS — regenerated `gates/output-floor-gate.json` |
| 2 | `verify_responsive.json` FAIL: stations table forces page-level sideways scroll at 280/320 px (overflow 68/28 px, table named as culprit) | Surgical (the documented intended fix: the table gets its own overflow container) | New `<div class="table-scroll">` wrapping ONLY the `<table>` + `.table-scroll { overflow-x: auto; }` — the section heading stays put; the page never scrolls sideways | PASS — regenerated `gates/verify_responsive.json`: 0 px overflow at 280/320/414 |
| 3 | `verify_frametime.mobile.json` FAIL: p95 83.2 ms vs 33 ms budget, 11.8 % dropped frames, cause undiagnosed | Diagnose-first (see protocol below) | See "Frame-time diagnosis" | See "Frame-time diagnosis" |

Residual `[warn] landmark-aux: no nav landmark` — confirmed legitimate: the content
model (`../../content-model.md`) defines a single status board with no navigation
content; the warn asks exactly for this confirmation.

Considered and deliberately not done (recorded follow-up, not a defect): making the
new `.table-scroll` container explicitly keyboard-focusable
(`tabindex="0" role="region" aria-label`). No shipped gate requires it, recent
Chromium makes overflowing scroll containers keyboard-focusable by default, and
adding it would flip the keyboard/states explicit zero-measure records — a scope
expansion beyond the named finding. If a future pass adds interactive controls to
this page, revisit the container's focusability and accessible name then.

Non-changes (guard 1, intent protection): the inline token block's raw hex
(soft token-conformance findings in `static-gates`) mirrors `tokens.css` verbatim and
predates this pass — persistent, not in scope. No data markup was touched: the
unknown-station rows, the 06-28 null-day gap, and the `est.` flag are byte-identical
to the pre-repair page.

## Frame-time diagnosis — protocol pre-registered BEFORE measurement

The committed FAIL was captured 2026-07-26T20:51Z. The page contains no JS, no CSS
animations, no images, no web fonts — there is no obvious page-side frame cost, so
the cause must be established, not assumed. Machine-load context: session records
show other PixelHelm sessions (E1 tail) active on this machine at capture time, and
the validator's own note binds the verdict to the run that produced it.

Protocol (declared before any new measurement was taken):

1. All measurement runs happen on a QUIET machine (the three E3 experiment sessions
   finished; CPU sampled < 25 % beforehand) — same machine as the committed FAIL.
2. Reproduce: `verify_frametime --mobile` × 5 on the repaired page. Report every
   run's p95 / dropped% here, no omissions.
3. Isolate if it reproduces (any FAIL among the 5): re-run with throttle off
   (`--mobile --cpu-throttle 1`) and desktop-viewport-with-throttle
   (`--cpu-throttle 4`) to separate CPU throttle from DPR-2 raster; then attribute
   long frames via an in-page longtask/rAF probe on the same emulation profile.
4. The COMMITTED `gates/verify_frametime.mobile.json` is one fresh single run
   executed after the diagnosis, committed as-produced. Selection rule: it is simply
   the next run after the diagnosis concludes — never a cherry-pick. If the 5-run
   distribution straddles the budget (flaky), the committed record is whatever that
   next run produces, and the flakiness is documented here with all numbers.
5. Verdict rule: page's fault only if a page-side cost is attributable (then fix
   minimally and re-run); otherwise harness/environment, documented honestly with
   the FAIL (if it reproduces) or with the passing re-run (if it does not).

### Protocol deviation (declared before measurement)

Step 1's quiet-machine precondition was WAIVED by owner instruction ("go ahead")
while the three E3 experiment sessions were still running. CPU load sampled around
every run is reported below so the conditions are part of the record. The isolation
matrix and trace attribution turned out to make the load question moot — see the
verdict.

Additionally declared before the regeneration sequence ran: the committed DESKTOP
`gates/verify_frametime.json` is likewise the single run executed in that sequence,
committed as-produced, with load context documented here — same no-cherry-pick rule.

### Results

Reproduction, repaired page, `--mobile` × 5 (CPU load % sampled before/after each):

| run | load before/after | p50 | p95 | max | dropped | samples |
|---|---|---|---|---|---|---|
| 1 | 87 / 51 | 16.7 | 116.6 | 116.6 | 11.1 % | 18 |
| 2 | 37 / 73 | 16.7 | 50.1 | 50.1 | 11.8 % | 17 |
| 3 | 62 / 80 | 16.7 | 49.9 | 49.9 | 11.8 % | 17 |
| 4 | 87 / 52 | 16.7 | 83.3 | 83.3 | 11.8 % | 17 |
| 5 | 90 / 22 | 16.7 | 116.7 | 116.7 | 12.5 % | 16 |

The FAIL reproduces 5/5 — but with a structure random contention cannot produce:
p50 is a perfect vsync 16.7 in every run, and every run drops exactly ~2 frames.
The scripted pass issues exactly 2 wheel steps on this page (887 px scroll range ÷
487 px steps), so the signature is one multi-vsync stall per wheel step, quantized
to whole frame periods (3/5/7 × 16.7 ms).

Isolation matrix (single runs):

| variant | p95 | max | dropped | verdict |
|---|---|---|---|---|
| A `--mobile --cpu-throttle 1` (throttle OFF) | 83.3 | 83.3 | 13.3 % | still FAILS — the stall is NOT CPU-throttle-scaled |
| B desktop viewport DPR 1, `--cpu-throttle 4` | 16.9 | 16.9 | 0 % | PASSES — throttle alone is innocent |
| C minimal plain-text control page, full `--mobile` profile | 16.8 | 33.3 | 2.3 % | PASSES — the emulation profile alone is innocent |

Trace attribution (Playwright tracing across all processes, same mobile profile,
scratch run): during the captured 66.6 ms long frame, **no event in any traced
process exceeded 3 ms** — the renderer main thread, raster threads, and GPU were
idle while frame production stalled.

### Verdict: harness/environment, not the page

The page ships no JS, no CSS animations, no images, no web fonts; the stall is
throttle-invariant (A), absent at DPR 1 (B), absent for plain text under the same
profile (C), and the trace shows an idle frame-scheduling gap, not attributable
work. Conclusion: a headless frame-scheduling stall of the emulated-mobile profile
(DPR 2 + synthetic wheel bursts against this amount of painted content) on this
machine — not page-authored cost. Per the repair contract this is NOT fixed by
editing the page (any page edit would be gaming the harness, not clearing a
defect): the mobile frame-time FAIL stays committed honestly, now with its cause
diagnosed. If the budget's owner later re-registers the mobile profile (e.g. headed
capture or a scheduling-stall exclusion), that is a gate-design decision, not a
page repair.

### Committed records produced after the diagnosis (regeneration sequence, as-produced)

- `gates/verify_frametime.json` (desktop; CPU load 35 % sampled immediately before):
  p50 16.6 / p95 17.0 / max 17.0 ms, 0 % dropped, 16 samples — **PASS** against
  16.7 + 1 ms.
- `gates/verify_frametime.mobile.json`: p50 16.7 / p95 49.9 / max 49.9 ms, 12.5 %
  dropped (2 of 16 — the per-wheel-step signature again), — **FAIL** against
  33 + 1 ms, committed as-produced per the protocol. Small-sample honesty carries
  over: at 16 samples, nearest-rank p95 equals the max.

## Re-render

The full render matrix (1440/375 × light/dark) was regenerated after the edits;
`../../renders/render.json` + PNGs are the post-repair page. Mode fidelity: see the
manifest.

## Honest banner

Gates prove correctness, not taste (pixelhelm-evaluate seam rule): clearing the
output floor and the overflow gate earns no design approval, and this pass makes no
register or panel claim. The page remains the loop's output; this pass changed only
what the named findings required.
