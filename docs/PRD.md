# Product Requirements Document — TrailScope

## Problem Statement (verbatim framing from hackathon brief)

With the rapid rise of digital banking and online transactions, financial cybercrimes such as fraud, money laundering, mule account activity, and layered transactions have become increasingly sophisticated. Investigators often deal with massive amounts of interconnected transaction data, making it difficult to manually trace suspicious financial activities and identify hidden fraud networks.

**Objectives (from brief):**
- Detect suspicious or anomalous transactions
- Identify potential fraud patterns
- Visualize money trails through interactive network graphs
- Improve the efficiency of cybercrime and financial fraud investigations using AI-driven analytics

**Expected features (from brief), mapped to our build:**

| Brief feature | Our implementation |
|---|---|
| AI-Driven Anomaly Detection & Risk Scoring | Isolation Forest model on behavioral features, 0-100 risk score per account |
| Interactive Money Trail Visualization Engine | vis-network.js graph, color-coded by risk, click-to-inspect |
| Automated Fraud Pattern Detection System | Rule-based detectors layered on the graph: circular flow, rapid relay, fan-in/fan-out |

## User (Persona)

A financial crime investigator at a bank or regulator who currently spends hours per case manually cross-referencing transaction logs in spreadsheets. They are not a data scientist — outputs must be visual and explained in plain language, not raw model output.

## Core User Journey (this IS the demo script)

1. Investigator opens TrailScope, sees a **risk leaderboard** — accounts sorted by risk score, worst first.
2. They click the top account. A **money trail graph** expands, centered on that account, showing connected accounts as nodes and transactions as edges.
3. Suspicious accounts are colored red/orange; the shape of the fraud (a circle, a fan-out to many accounts) is immediately visible.
4. They click a flagged node. A side panel explains: *"Flagged: rapid fund relay. Received ₹2,40,000 from Account A, forwarded ₹2,38,500 to Account C within 3 minutes."*
5. They can search/filter to pull up any account by ID and inspect its trail the same way.

That's the whole product. Five steps, all visual, all explainable. Nothing else is required to win — resist adding more.

## Functional Requirements

### Must-have (P0 — the demo breaks without these)
- Risk-scored account list (sortable)
- Graph view rendering at least 1 clear fraud ring on load
- Click-to-inspect side panel with plain-language explanation
- Search by account ID

### Nice-to-have (P1 — only if time remains after P0 is rock-solid)
- Filter graph by risk threshold (slider)
- "Export findings" button (even if it just downloads the JSON — judges like seeing a complete workflow)
- Summary stats bar (total accounts scanned, flagged count, estimated amount at risk)

### Explicitly not building (P2 — cut entirely)
- Live transaction ingestion
- Multi-user accounts / login
- Editable/persisted database (read-only precomputed JSON is fine)
- Mobile responsiveness (demo will be on a laptop screen)

## Judging Criteria Alignment

Most hackathon rubrics weight some mix of: **Innovation/Uniqueness, Technical Implementation, Impact/Relevance, Presentation/Demo.** Here's how this build targets each:

- **Innovation/Uniqueness:** Graph-first investigation UI (not a table of flagged rows) is the differentiator. Say this explicitly in the pitch.
- **Technical Implementation:** Real anomaly detection model validated against ground-truth labels (PaySim's `isFraud` column) — have an actual precision/recall number ready, even if modest. Don't claim more rigor than you have.
- **Impact/Relevance:** Frame in the pitch around real cost — financial fraud losses are massive and rising; investigator time is the bottleneck, not data availability.
- **Presentation/Demo:** A rehearsed, click-through demo with a visually distinct dark "investigation console" aesthetic (not a generic admin template) signals polish disproportionate to the build time.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Model produces unconvincing/random-looking scores | Validate against `isFraud` ground truth early (Phase 2); if scores look bad, fall back to a hybrid: weight the unsupervised score with a few hand-picked rule signals |
| Graph looks like a messy hairball, not a clear "ring" | Hand-pick/verify 2-3 specific fraud examples from the data for the default view rather than rendering everything at once |
| Frontend/backend integration breaks late | Lock `docs/DATA_SCHEMA.md` early; frontend builds against mock JSON matching that schema from minute 30, doesn't wait for real backend |
| Running out of time on polish | Phase 5 (demo polish) is non-negotiable — if Phase 3 or 4 overruns, cut P1 features, not demo rehearsal time |
