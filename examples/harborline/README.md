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
| `status-page.html` | The winning candidate: authored by the CHEAPEST worker model in the experiment, register-fit median 9/10 from a blind 5-juror panel — twice (it also beat candidates produced with larger skill sets). Single file, both modes via `data-theme`. |
| `renders/` | Its render matrix (1440/375 × light/dark) + the `render.json` manifest with per-cell mode-fidelity. |

## Reproduce the loop on this example

```
# the machine floor (contrast 30/30 + raw-color walk + anti-cliché grep):
node <plugin>/skills/design-evaluate/scripts/static-gates.mjs examples/harborline/profile.json

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

During the experiment, the strongest worker model noticed that the fixture's own
alert ("three stations… over 24 hours") contradicted one station's timestamp (~20h) —
a bug in OUR fixture, not the design. It responded exactly per the honesty contract:
rendered the fixture verbatim, asserted no independent claims, and reported the
inconsistency. The fixture shipped here is corrected. The other honest artifact of
the experiment: the one candidate that invented a claim ("Updates every 5 minutes" —
no cadence exists in the fixture) was disqualified by the blind honesty audit. The
floor works.
