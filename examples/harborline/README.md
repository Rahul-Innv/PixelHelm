# Harborline — the worked example

A civic bike-share status page, built by the plugin's core loop and shipped here as
the worked example AND the substrate of the model-dependence experiment the top-level
README cites.

## What's in here

| File | What it is |
|---|---|
| `fixture.json` | The ONLY data source — synthetic, labeled as sample data, with deliberate honesty bait: three stations with `null` telemetry (must render *unknown*, never 0), a logging-outage day (`rides: null` — must stay a visible labeled gap), an `estimated` flag that must survive at every display site, totals that are only true with their "reporting stations only" qualifier, and one 54-character station name (content-robustness bait). |
| `content-model.md` | What a COMPLETE page must contain + the honesty invariants the council audits against. |
| `profile.json` | The project profile: the `_register` string ("civic-utility calm…"), the inline AA token contract (30 gated pairs, both modes), banned clusters. |
| `tokens.css` | The token block — the only file allowed to carry raw color. |
| `status-page.html` | The winning candidate. Single file, both modes via `data-theme`. *Attested history, not committed evidence:* per the author's private development runs it was authored by the CHEAPEST worker model in the experiment and scored register-fit median 9/10 from a blind 5-juror panel, twice, beating candidates produced with larger skill sets — but no juror scores, verdict records, or losing candidates are committed in this tree, so treat those numbers as narrative until the loop is re-run with records. |
| `renders/` | Its render matrix (1440/375 × light/dark) + the `render.json` manifest with per-cell mode-fidelity. |
| `gates/` | **Committed gate-run artifacts** — every shipped floor validator executed against `status-page.html`, failures included. Two runs FAIL honestly: the structural output floor (the page's three documented gaps, now blocked) and responsive overflow at 280/320px (a new escape the floor caught on its first run). See `gates/README.md`. |

## Reproduce the loop on this example

```
# the machine floor (contrast 30/30 + raw-color walk + anti-cliché grep):
node <plugin>/skills/design-evaluate/scripts/static-gates.mjs examples/harborline/profile.json

# the structural output floor (landmarks / headings / meta description — FAILS here, see gates/):
node <plugin>/skills/design-evaluate/scripts/output-floor-gate.mjs examples/harborline/status-page.html

# the browser-arm floor (overflow / state contrast / focus trap / target size — see gates/):
node <plugin>/skills/design-evaluate/scripts/verify_responsive.mjs examples/harborline/status-page.html

# the render matrix:
node <plugin>/skills/design-render/scripts/render.mjs \
  --target examples/harborline/status-page.html \
  --out /tmp/harborline-renders --viewports 1440,375 --modes light,dark --open
```

Or run the whole loop: point Claude at this folder and ask it to *"redesign the
Harborline status page"* — the router grounds on `profile.json`, the tournament runs
against `status-page.html` as the incumbent, and the council's verdict must clear the
incumbent guard. ("Current design wins — no change recommended" is a legal outcome;
this page has survived two blind panels, so expect it to put up a fight.)

## One honest footnote

(Both anecdotes below are attested from the author's private experiment runs — their
artifacts are not committed here.) During the experiment, the strongest worker model
noticed that the fixture's own alert ("three stations… over 24 hours") contradicted
one station's timestamp (~20h) — a bug in OUR fixture, not the design. It responded
exactly per the honesty contract: rendered the fixture verbatim, asserted no
independent claims, and reported the inconsistency. The fixture shipped here is
corrected. The other reported artifact of the experiment: the one candidate that
invented a claim ("Updates every 5 minutes" — no cadence exists in the fixture) was
disqualified by the honesty audit. What IS verifiable in this tree: the honesty
invariants hold in the shipped page's markup, and the render matrix is committed.
