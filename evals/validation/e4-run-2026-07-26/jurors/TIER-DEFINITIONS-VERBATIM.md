<!-- PROVENANCE: copied VERBATIM from section 2 ("The four tiers") of the Phase-1 dossier
     "05-WHAT-MAKES-A-WEBSITE-EXCEPTIONAL-DOSSIER.md", portfolio-capability-research
     outputs dated 2026-07-26 (owner research archive, outside this repo). Lines below are
     the exact section text, unedited. Required juror input per the sealed E4 sheet (a). -->

## 2. The four tiers

### Tier 1 — Non-negotiable quality floor (this program's normative floor POLICY)

Framing per critic-1 defect 10: the items below are grounded in testable external standards (WCAG, CWV) and evidence-backed fundamentals, and this program adopts them as a hard floor by policy. The empirical claim "no site can be excellent for its audience without every item" is NOT established — e.g., corpus award winners violate the resilience item while achieving juried esteem. The floor is what this program will refuse to trade away, stated as policy with reasons, not as a law of nature.

*Fundamentals (owner-directed first-class layer):*
- Communicate what the site is within seconds — value proposition inside the ~10 s window [FD-02]
- Written for scanners: front-loaded, subheaded, concise, objective; ~20% of words get read [FD-01, FD-03]
- Conventional mechanics: navigation, links, forms, and feedback follow platform conventions (Jakob's Law; heuristic #4); novelty lives in the brand layer, not the mechanics layer [FD-04]
- Legible body text: ~15–25 px, 120–145% leading, ~45–90 characters/line (convention ranges; the peer-reviewed line-length literature is mixed — comprehension favored ~55 cpl in one study while another found 95 cpl fastest with no comprehension penalty) [FD-06, refuter D12]
- Task-based navigation with working search; answer the user's actual questions, including pricing [L2-02, FB-5a]
- Forms: minimum fields, specific field-level errors, input never lost [FD-07]
- Mobile content parity — the mobile version is the site [FD-08]
- Trust basics: real organization, easy contact, evident freshness, zero sloppy errors [FD-09]
- Fast: the one fundamental with repeated quasi-causal outcome evidence [FD-13]

*Standards (external, testable):*
- WCAG 2.2 AA as the hard conformance bar — contrast 4.5:1, reflow at 320 px, visible unobscured focus, 24×24 px targets, pause/stop/hide for >5 s motion, no 3-flashes [BF-06, ST]
- `prefers-reduced-motion` honored even though 2.3.3 is AAA — the harms (nausea, migraines, bed rest) are severe relative to a one-media-query cost [L4-05]
- Core Web Vitals good at p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1 [BF-07]
- Semantics/SEO floor: unique titles/descriptions, real headings, alt text, descriptive URLs/anchors, indexability, HTTPS [ST-S8]
- Resilience: meaningful content without JavaScript; the corpus's award-winning WebGL sites fail this outright [L6-02]

Reality check: GOV.UK itself self-declares only partial WCAG 2.2 AA with ~20 known issues [L6-03] — one prominent instance showing the floor is a direction of rigor rather than a solved problem, and that documenting gaps is itself a trust practice. (No survey of top-site conformance was conducted; the earlier "rare even at the top" generalization is retracted.)

### Tier 2 — Strong professional execution (clears the floor, earns trust, converts)

- A coherent design system: consistent components, spacing scale, type hierarchy (~3 sizes), limited palette with stable color-meaning [FD-10, VP]
- Visual hierarchy expressing information priority, not drama [VP-1]
- Content architecture matched to the audience's mental model; plain language even for expert readers [L2-02]
- Credibility engineering: verifiable claims, restrained promotion (objective copy measurably outperformed promotional "marketese" in the 1997 study — direction only, per FD-03's never-quote-the-magnitude rule; the earlier "−27%" figure was a sign-flipped derivation and is retracted, refuter-2 F8), visible expertise [FD-03, FD-09]
- Conversion paths that respect the user: clear CTAs, transparent pricing, low-friction booking/contact [L5-03]
- Iteration against evidence — analytics, benchmarks, or tests — rather than taste alone [L5-02]
- Craft in the details: alignment, spacing rhythm, polish (VisAWI craftsmanship; "nothing arbitrary") [L3-01, FD-12]
This tier is where most good professional sites live. It is fully achievable by discipline alone; nothing here requires creative brilliance. It earns quiet trust — but not "wow," and not memory.

### Tier 3 — Distinctive excellence (memorable, archetype-true, still floor-clean)

- **A one-sentence signature idea** that all four layers (content, visuals, interaction, engineering) reinforce — this program's design heuristic, constructible for every corpus exemplar, though unfalsifiable as a universal law [L1-01: unclear as universal; supported as analysis]
- **Congruence:** the signature is earned by and true of the organization — imitated signatures fail ("the magic evaporates"); trend adoption (Linear-Look, Stripe-alikes) yields polished genericness [L1-04, RF-06]
- **Archetype truth** (design hypothesis — L8-04 is `unclear`; transplant failures were argued, not tested): the signature speaks the archetype's success language — service culture for commerce (Nordstrom), triage for health (NHS), disappearing interface for government (GOV.UK), method-as-manifesto for pro tools (Linear)
- **Voice:** writing that no competitor could publish unchanged
- **Deliberate convention-breaking:** at most one or two conventions broken, deliberately, in the brand layer, with the mechanics layer left conventional [FD-04 nuance, RF-02]
- Craft detail sufficient that professionals notice (this is what award juries actually certify [L5-01])

### Tier 4 — The defensible "wow" ceiling

This program's chosen wow target — a **normative design heuristic, not the one established form of wow** [W-02; rivals held open in §1a] — is **a signature moment that demonstrates the site's thesis: proof-by-experience**. Corpus readings consistent with it:
- Bruno Simon: driving the car IS the WebGL credential.
- Stripe: the gradient + micro-interaction rigor IS the "we sweat details with your money" argument.
- The Pudding: scroll-paced data-as-biography IS the journalism.
- Stripe Docs: your own API key in the copy-paste sample IS the developer empathy.
- GOV.UK: the interface disappearing IS the institutional promise ("do the hard work to make it simple").
- Apple: capability demonstrated (zoom photos, 3D viewers), not listed — though its genre carries a documented scrolljacking record as the cost of pacing control [HU-4].

Conditions that keep the ceiling defensible (each is a supported constraint):
1. The wow moment sits **after** the floor: reduced-motion parity, pause/stop/hide, JS-fallback content, CWV budget held [L4-05, L6-01/02/04]
2. The wow moment is **the argument**, not an interruption of it [W-02]
3. It's **archetype-gated**: the same moment that elevates a portfolio harms a utility [RF-07]
4. It **survives the second visit**: returning users can bypass it (a mandatory playful loader is friction on visit two [corpus: Don't Board Me])
5. Its **cost is measured**: motion and 3D are performance debt and vestibular risk until proven otherwise [RF-03]

What produces *fake, fragile, or counterproductive* wow (all evidenced): spectacle detached from thesis (Snow Fall imitators — effects without the reporting); trend imitation (polished genericness); scrolljacking and auto-motion (disorientation, ad-blindness, exclusion of motion-sensitive users); splash-style delay that spends the 10-second window before communicating value; awards-bait optimizing a juror's 30-second visit over a user's task [RF-01..RF-07, L4-01..03, FD-02].

