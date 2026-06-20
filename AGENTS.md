# AGENTS.md — Instructions for AI Coding Assistants (Cursor / Antigravity / Windsurf)

This file is read by AI coding agents working in this repo. Follow it strictly — this is a 6-hour hackathon build, and time wasted on over-engineering directly costs us the win.

## Context

This is a hackathon project (NEXORA'26) being built in 6 hours by a small team. The judging criteria favor a **working, demo-able product with a unique angle** over technical completeness. Every suggestion, file, or feature you propose should be filtered through: "Does this help a 2-minute live demo land, in the time we have left?"

Read `README.md` and `docs/PRD.md` first, before writing any code. Read `docs/DATA_SCHEMA.md` before writing anything that touches data shapes (this defines the JSON contract between backend and frontend — frontend can build against mock data matching this schema before the real pipeline is done).

## Hard Rules

1. **No scope creep.** If a request would add a feature not listed in README.md's "In scope" section, flag it back to the user rather than silently building it: "This isn't in the 6-hour scope — do you want me to build it anyway, trading time from X?"
2. **No premature optimization.** Don't suggest Docker, CI/CD, test suites, type-checking infra, or production deployment configs. We need it to run on localhost for a demo, once, reliably.
3. **Precompute everything possible.** Live model inference during the demo is a risk. Default to: train/compute once, export to JSON, serve the JSON. Only suggest live computation if the user explicitly asks for it.
4. **Fail loud, fail fast, fail simple.** If a library install fails or a dataset download is slow, immediately suggest the fastest fallback (e.g., switch to a smaller synthetic dataset generated in-script) rather than debugging for more than ~5 minutes.
5. **Explainability over accuracy.** This is a fraud-detection tool being pitched to judges. A model that's 85% accurate and whose flags can be explained in one sentence ("flagged for rapid fund relay: $50k in, $49.5k out within 4 minutes") beats a 95% accurate black box. Always carry through a "reason" field alongside any score.
6. **Match the data schema exactly.** See `docs/DATA_SCHEMA.md`. Backend and frontend are built in parallel by different team members — breaking the schema breaks the integration at the worst possible time (hour 5).

## Code Style

- Python: keep scripts flat and readable (this is not a library, it's a hackathon pipeline). Prefer pandas vectorized operations over loops for speed, but don't spend time on perfect idiomatic code — working and readable beats clever.
- No need for extensive docstrings or type hints everywhere — brief comments at the top of each function explaining *what* and *why* are enough.
- Frontend: functional React components, keep state local unless there's a clear reason to lift it. Don't introduce Redux/Zustand/state libraries for a 6-hour single-page demo — React's `useState`/`useContext` is enough.
- Don't add authentication, routing libraries, or multi-page navigation. This is a single-screen dashboard with a modal/panel for details.

## When Asked to Build Something

1. Check `docs/TASK_BREAKDOWN.md` for the current phase and what's already expected to exist.
2. If a file already exists (e.g., `risk_scores.json` is already generated), don't regenerate it from scratch unless asked — read and use it.
3. If blocked on a missing dependency or dataset, propose the fastest unblock, don't ask the user to wait.
4. After generating code, briefly state what to run and what output to expect — the team needs to keep moving, not debug your output.

## Demo-Readiness Checklist (refer back to this constantly)

Before considering any component "done," it should pass:
- [ ] Does it run with one command (or one click) with no manual fiddling?
- [ ] Does it work with the actual (sampled) PaySim data, not just a toy example?
- [ ] If it's visual, does it look intentional (not default Bootstrap/unstyled HTML)? See `docs/FRONTEND_DESIGN_NOTES.md`.
- [ ] If it's a model/score, can a team member explain *why* it works in one sentence to a judge?

## File Ownership (avoid merge conflicts during parallel work)

- `backend/data_prep.py`, `backend/feature_engineering.py`, `backend/train_model.py` → ML teammate
- `backend/graph_builder.py`, `backend/main.py` → Backend/graph teammate
- `frontend/**` → Frontend teammate
- `docs/**` → Shared, edit freely, but don't restructure `DATA_SCHEMA.md` without flagging to the team (it's the integration contract)
