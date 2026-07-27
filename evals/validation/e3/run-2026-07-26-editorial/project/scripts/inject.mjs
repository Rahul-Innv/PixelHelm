#!/usr/bin/env node
// inject.mjs — E3 editorial build-time injector (honesty-gates injector pattern).
// Pure arithmetic on JSON literals from the sealed data file ONLY. Never reads
// the clock, never invents a value. Pages print these constants; the
// derived-claims gate re-diffs the render against data + these constants.
//
// Era definitions (fixed here, before any candidate exists):
//   firstEra    = the first five recorded years, 1990–1994 (all manual gauge);
//   lastEraVer  = the last five VERIFIED years, 2018 + 2020–2023 (2019 is
//                 excluded from every era mean because it is flagged
//                 "unverified outlier"; it appears only with that label).
// Rounding: Math.round on era means; the rounded integers are the printable
// constants. Calendar mapping uses the sealed definition (Sep 1 = day 244) in
// a non-leap year.
//
// Usage: node inject.mjs   (from anywhere; writes data/derived.json)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const project = dirname(here);
const data = JSON.parse(readFileSync(join(project, "data", "ashcombe-rainfall.json"), "utf8"));

const years = data.years;
const recorded = years.filter((y) => y.onsetDayOfYear !== null);
const firstEraYears = [1990, 1991, 1992, 1993, 1994];
const lastEraYears = [2018, 2020, 2021, 2022, 2023];
const pick = (ids) => ids.map((id) => years.find((y) => y.year === id));
const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
const rmean = (rows, f) => Math.round(mean(rows.map((r) => r[f])));

const firstEra = pick(firstEraYears);
const lastEra = pick(lastEraYears);

const onsetMeanFirst = rmean(firstEra, "onsetDayOfYear");   // 252
const onsetMeanLast = rmean(lastEra, "onsetDayOfYear");     // 280
const totalMeanFirst = rmean(firstEra, "wetSeasonTotalMm"); // 606
const totalMeanLast = rmean(lastEra, "wetSeasonTotalMm");   // 692
const max24hMeanFirst = rmean(firstEra, "max24hMm");        // 43
const max24hMeanLast = rmean(lastEra, "max24hMm");          // 72

const onsetShiftDays = onsetMeanLast - onsetMeanFirst;                    // 28
const onsetShiftWeeksApprox = Math.round(onsetShiftDays / 7);             // 4
const totalRiseMm = totalMeanLast - totalMeanFirst;                       // 86
const totalRisePct = Math.round((totalRiseMm / totalMeanFirst) * 100);    // 14
const max24hRiseMm = max24hMeanLast - max24hMeanFirst;                    // 29

// Calendar mapping per the sealed definition: day 244 = Sep 1, non-leap year.
const MONTHS = [
  ["January", 31], ["February", 28], ["March", 31], ["April", 30], ["May", 31],
  ["June", 30], ["July", 31], ["August", 31], ["September", 30], ["October", 31],
  ["November", 30], ["December", 31],
];
function dayOfYearToDate(doy) {
  let d = doy;
  for (const [name, len] of MONTHS) {
    if (d <= len) return { month: name, day: d };
    d -= len;
  }
  throw new Error(`day-of-year out of range: ${doy}`);
}
const onsetFirstDate = dayOfYearToDate(onsetMeanFirst);  // September 9
const onsetLastDate = dayOfYearToDate(onsetMeanLast);    // October 7

const yearFirst = years[0].year;                          // 1990
const yearLast = years[years.length - 1].year;            // 2023
const yearsSpan = yearLast - yearFirst + 1;               // 34
const recordedCount = recorded.length;                    // 31
const missingCount = yearsSpan - recordedCount;           // 3

// Axis / shelf scales (presentation constants — every tick a page may print).
const onsetShelf = { minDay: 244, maxDay: 288, ticks: [244, 258, 274, 288],
                     tickLabels: ["Sep 1", "Sep 15", "Oct 1", "Oct 15"] };
const totalAxis = { min: 550, max: 750, ticks: [550, 600, 650, 700, 750] };
const max24hAxis = { min: 0, max: 150, ticks: [0, 25, 50, 75, 100, 125, 150] };

const derived = {
  _note: "Injected constants — pure arithmetic on sealed-data literals (inject.mjs). The only legal numbers beyond the data file itself.",
  eras: {
    firstEraYears, lastEraYears,
    firstEraLabel: "1990-1994 (manual gauge)",
    lastEraLabel: "2018 and 2020-2023 (automated weir; 2019 excluded as an unverified outlier)",
  },
  onsetMeanFirst, onsetMeanLast, onsetShiftDays, onsetShiftWeeksApprox,
  onsetFirstDate, onsetLastDate,
  totalMeanFirst, totalMeanLast, totalRiseMm, totalRisePct,
  max24hMeanFirst, max24hMeanLast, max24hRiseMm,
  yearFirst, yearLast, yearsSpan, recordedCount, missingCount,
  onsetShelf, totalAxis, max24hAxis,
  globalAllow: [
    onsetMeanFirst, onsetMeanLast, onsetShiftDays, onsetShiftWeeksApprox,
    onsetFirstDate.day, onsetLastDate.day,
    totalMeanFirst, totalMeanLast, totalRiseMm, totalRisePct,
    max24hMeanFirst, max24hMeanLast, max24hRiseMm,
    yearFirst, yearLast, yearsSpan, recordedCount, missingCount,
    ...onsetShelf.ticks, ...totalAxis.ticks, ...max24hAxis.ticks,
  ],
};
writeFileSync(join(project, "data", "derived.json"), JSON.stringify(derived, null, 2) + "\n");
console.log("derived.json written:", JSON.stringify({
  onsetMeanFirst, onsetMeanLast, onsetShiftDays, totalMeanFirst, totalMeanLast,
  max24hMeanFirst, max24hMeanLast, yearsSpan, recordedCount, missingCount,
}));
