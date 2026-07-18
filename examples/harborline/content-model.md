# Harborline status page — content model (what a COMPLETE page must contain)

Everything below renders from `fixture.json` and nothing else. The page carries a
visible "Sample data" label (the fixture is synthetic and says so).

1. **Network verdict line (leads):** stations reporting (9 of 12), bikes available +
   docks free — WITH the "reporting stations only" qualifier; as-of timestamp.
2. **Alerts** — both, verbatim meaning preserved; the warning's "UNKNOWN, not zero"
   framing must survive.
3. **Station table** (all 12 rows, real names incl. the 54-char S03): status, bikes,
   docks, last telemetry. `no-telemetry` stations show UNKNOWN (never 0, never a
   stale count presented as live); `maintenance` shows the closure note.
4. **Ridership, last 7 days** — honest viz: the 06-28 null is a visible GAP (never
   interpolated, never zero); 07-01 carries its "estimated" flag; rides-today
   repeats the estimate + why.
5. **Data-freshness footer** — as-of time + the sample-data label.

## Honesty invariants (what the council's honesty lens checks against this file)
- No value on the page that is not derivable from fixture.json.
- unknown ≠ 0; gap ≠ interpolation; estimated is labeled at the point of display.
- Totals only over reporting stations, said so.
- No invented trends ("ridership up X%"), no invented stations/sponsors/cities.
