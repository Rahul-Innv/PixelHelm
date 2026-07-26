#!/usr/bin/env node
// inject.mjs — E3(saas) build-time injector (honesty-gates injector pattern).
// Pure arithmetic/mapping on JSON literals from the sealed data file ONLY.
// Never reads the clock, never invents a value. Pages print these constants;
// the derived-claims gate re-diffs the render against data + these constants.
//
// Also emits the per-block model collection (ids frozen in ground/GROUND.md)
// that Gate A uses for association money-scoping and verdict/provisional
// status: statuses are deterministic literal mappings (integration.status
// verbatim; claims/testimonials: verified:true -> "verified", verified:false
// with an estimate basis -> "estimate", else "unverified").
//
// Usage: node inject.mjs   (from anywhere; writes project/data/derived.json)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const project = dirname(here);
const data = JSON.parse(readFileSync(join(project, "data", "ledgerline.json"), "utf8"));

const featureCount = data.features.length;
const integrationCount = data.integrations.length;
const shippedIntegrationCount = data.integrations.filter((i) => i.status === "shipped").length;
const betaIntegrationCount = data.integrations.filter((i) => i.status === "beta").length;
const tierCount = data.pricing.tiers.length;

const claimStatus = (c) =>
  c.verified === true ? "verified" : /estimate/i.test(c.basis || "") ? "estimate" : "unverified";

const INTEGRATION_IDS = { "Stripe payouts": "int-stripe", "Open Banking feed": "int-openbanking", "QuickBooks export": "int-quickbooks" };
const FEATURE_IDS = { "60-second invoice": "feat-invoice", "Chase-for-you reminders": "feat-reminders", "Materials markup": "feat-markup", "Tax pot": "feat-taxpot" };

const models = [
  ...data.features.map((f) => ({ id: FEATURE_IDS[f.name] })),
  ...data.integrations.map((i) => ({ id: INTEGRATION_IDS[i.name], status: i.status })),
  { id: "tier-solo", moneySet: [data.pricing.tiers[0].perMonth] },
  { id: "tier-crew", moneySet: [data.pricing.tiers[1].perMonth] },
  { id: "pricing", moneySet: data.pricing.tiers.map((t) => t.perMonth) },
  { id: "trial" },
  { id: "claim-pilot", status: claimStatus(data.claims[0]) },
  { id: "claim-textlink", status: claimStatus(data.claims[1]) },
  { id: "quote-okafor", status: claimStatus(data.testimonials[0]) },
];
for (const m of models) if (!m.id) throw new Error("unmapped model id");

const derived = {
  _note: "Injected constants + Gate-A model collection — pure literal arithmetic/mapping on the sealed data (inject.mjs). The only legal numbers beyond the data file itself.",
  featureCount, integrationCount, shippedIntegrationCount, betaIntegrationCount, tierCount,
  globalAllow: [featureCount, integrationCount, shippedIntegrationCount, betaIntegrationCount, tierCount],
  models,
};
writeFileSync(join(project, "data", "derived.json"), JSON.stringify(derived, null, 2) + "\n");
console.log("derived.json written:", JSON.stringify(derived.globalAllow), `models=${models.length}`);
