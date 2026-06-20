# Task Breakdown — 6 Hour Sprint

Three parallel workstreams after a shared 30-minute setup. Times are guidelines, not contracts — but if any phase runs more than 20 minutes over, cut scope rather than cut Phase 5 (demo polish).

## Phase 0: Shared Setup (0:00 – 0:30) — everyone together

- [ ] Agree on final problem framing & team narrative (5 min)
- [ ] Clone/init repo, everyone has it running locally
- [ ] Download PaySim dataset from Kaggle → place in `data/raw/paysim.csv`
- [ ] Confirm `docs/DATA_SCHEMA.md` — make any final tweaks now, lock it after this
- [ ] Split into the three workstreams below

---

## Workstream A: ML / Data (Owner: ML teammate) — 0:30 to 2:00

- [ ] `backend/data_prep.py`: load PaySim, stratified-sample to 5-10k rows (oversample fraud), save to `data/processed/sampled_transactions.csv`
- [ ] `backend/feature_engineering.py`: compute the 5 account-level features (see `docs/ML_APPROACH.md`)
- [ ] `backend/train_model.py`: fit IsolationForest, generate scores, tiers, and explanation strings
- [ ] Validate scores against `isFraud` ground truth — write down the precision number now, you'll need it for the pitch
- [ ] Export `data/processed/risk_scores.json` matching the schema exactly
- [ ] **Checkpoint at 2:00:** if behind, cut feature #5 (fan-in/fan-out) before cutting validation — the validation number is more important for credibility than a 5th feature

## Workstream B: Graph & Backend (Owner: backend teammate) — 0:30 to 3:30

*(Can start immediately using mock data matching the schema — doesn't need to wait for Workstream A)*

- [ ] `backend/graph_builder.py`: build NetworkX directed graph from sampled transactions (nodes=accounts, edges=transactions)
- [ ] Implement 3 pattern detectors: circular flow, rapid relay, fan-in/fan-out
- [ ] Manually inspect detected patterns, hand-pick 2-3 that look visually clean and compelling → these become `highlightedRings`
- [ ] Export `data/processed/graph.json` matching the schema
- [ ] `backend/main.py`: FastAPI app with the 5 endpoints from `docs/DATA_SCHEMA.md`, reading from the processed JSON files
- [ ] Once Workstream A's `risk_scores.json` lands (~2:00), merge risk scores into graph nodes (node `riskScore`/`riskTier` fields)
- [ ] **Checkpoint at 3:30:** API should be running locally, all 5 endpoints returning real data, testable via browser or `curl`

## Workstream C: Frontend (Owner: frontend teammate) — 0:30 to 5:00

*(Starts immediately against mock data — see `docs/DATA_SCHEMA.md` section 4)*

- [ ] Scaffold React app, install `vis-network` (or `react-graph-vis` wrapper)
- [ ] Build `mockData.js` matching the schema (3-5 accounts, 1 fake ring)
- [ ] Build dashboard shell: leaderboard table (left/top) + graph canvas (main area) + detail side panel (right, hidden until a node is clicked)
- [ ] Wire up vis-network: render nodes colored by `riskTier` (e.g., green/amber/red), edges with arrows showing direction
- [ ] Click handler: clicking a node populates the side panel with `flaggedReasons`, `totalTransactions`, `totalVolume`
- [ ] Search bar: filter/jump to account by ID
- [ ] Apply visual design direction — see `docs/FRONTEND_DESIGN_NOTES.md` (dark investigation-console aesthetic, NOT default Bootstrap)
- [ ] Once backend endpoints are live (~3:30), swap `mockData.js` imports for `fetch('/api/...')` calls
- [ ] **Checkpoint at 5:00:** full click-through works end to end against real data

---

## Phase 5: Integration, Polish & Pitch Rehearsal (5:00 – 6:00) — everyone together

- [ ] Full integration test: fresh page load → leaderboard shows real scores → click top account → graph centers on a real, visually clear ring → click a node → real explanation shows
- [ ] Fix any visual rough edges (overlapping labels, unreadable contrast, broken layouts) — see `docs/FRONTEND_DESIGN_NOTES.md` for the bar to hit
- [ ] Write/finalize `docs/DEMO_SCRIPT.md` talking points (should already be drafted — just rehearse)
- [ ] **Two full rehearsals** of the demo, timed, out loud, with whoever's clicking and whoever's talking actually practicing together
- [ ] Prepare for likely judge questions (see `docs/DEMO_SCRIPT.md` Q&A prep section)
- [ ] Submit with time to spare — do not be still coding at the deadline

## Time-Box Discipline

If you're checking this document and you're more than 15 minutes behind any checkpoint, do the cut immediately rather than hoping to catch up:
1. First cut: P1 features in PRD.md (filter slider, export button, stats bar)
2. Second cut: feature #5 in the ML feature set, or the 3rd pattern detector in the graph
3. Never cut: Phase 5 rehearsal time. A team with a slightly simpler but smoothly demoed product beats a team with more features that fumbles the live demo.
