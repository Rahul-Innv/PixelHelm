#!/usr/bin/env node
// inject.mjs — E3 build-time injector (honesty-gates injector pattern).
// Pure arithmetic on JSON literals from the sealed data file ONLY. Never reads
// the clock, never invents a value. Pages print these constants; the
// derived-claims gate re-diffs the render against data + these constants.
//
// Usage: node inject.mjs   (from anywhere; writes <project>/data/derived.json)
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const project = dirname(here);
const data = JSON.parse(readFileSync(join(project, "data", "foxglove-catalog.json"), "utf8"));

const products = data.products;
const productCount = products.length;
const inStockCount = products.filter((p) => p.stock > 0).length;
const outOfStockCount = productCount - inStockCount;
const pricedCount = products.filter((p) => typeof p.price === "number").length;
const pricePendingCount = productCount - pricedCount;

// Per-product derived block: stock status (for the Gate A verdict clause),
// the price literal copied through (per-block money set), and the germination
// percentage (round(value*100) — the only legal % rendering of the rate).
const derivedProducts = products.map((p) => ({
  sku: p.sku,
  price: typeof p.price === "number" ? p.price : null,
  stockStatus: p.stock > 0 ? "in-stock" : "out-of-stock",
  germinationPct: Math.round(p.germinationRate.value * 100),
}));

// Money figures carried inside the sealed shippingNote string (mechanical
// extraction of numeric literals, no invention): flat postage + free-over threshold.
const shippingFigures = (data.shippingNote.match(/\d+(?:\.\d+)?/g) || []).map(Number);

const germinationPcts = derivedProducts.map((p) => p.germinationPct);
const derived = {
  _note: "Injected constants — pure arithmetic on sealed-data literals (inject.mjs). The only legal numbers beyond the data file itself.",
  productCount, inStockCount, outOfStockCount, pricedCount, pricePendingCount,
  products: derivedProducts,
  globalMoneyAllow: shippingFigures,
  globalAllow: [...new Set([productCount, inStockCount, outOfStockCount, pricedCount,
                            pricePendingCount, ...germinationPcts, ...shippingFigures])],
};
writeFileSync(join(project, "data", "derived.json"), JSON.stringify(derived, null, 2) + "\n");
console.log("derived.json written:", JSON.stringify(derived.globalAllow));
