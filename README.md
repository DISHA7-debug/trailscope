# TrailScope — AI-Powered Financial Crime Investigation & Money Trail Visualization

> Hackathon: NEXORA'26 | Track: Cybersecurity & Digital World
> Time budget: 6 hours | Team focus: ML/Data Science

## 1. The Problem (judge-facing framing)

Digital banking has made financial crime faster and harder to trace. Fraud, money laundering, and mule-account networks now move money through dozens of accounts in minutes. Investigators are stuck doing this manually — reading transaction logs row by row — while the money trail goes cold.

**The gap:** existing tools flag individual suspicious transactions. None of them show the investigator the *shape* of the crime — the network of accounts working together.

## 2. The Solution

TrailScope is an AI-assisted investigation console that:
1. **Scores** every account/transaction for risk using anomaly detection (not just rule-based thresholds).
2. **Visualizes** the money trail as an interactive graph, so fraud rings are *seen*, not just listed.
3. **Explains** every flag in plain language, so investigators trust and can act on the system's output.

This is our differentiator: most teams will demo a table of flagged rows. We demo a living network graph an investigator can click through in seconds.

## 3. Scope for 6 Hours (be ruthless about this)

**In scope:**
- Pre-trained risk scoring model (Isolation Forest, trained once, scores exported to JSON — no live retraining during demo)
- Pre-computed graph with 2-3 guaranteed, compelling fraud-ring examples
- Clean dashboard: leaderboard + graph view + "why flagged" panel
- One polished, rehearsed live demo flow

**Explicitly out of scope (do not attempt):**
- Real-time transaction streaming
- User authentication / multi-tenant accounts
- Production-grade deployment, Docker, CI/CD
- Training on the full 6M-row PaySim dataset (sample down to 5,000–10,000 rows)
- Any feature not directly supporting the demo narrative

If you find yourself building something not in "In scope," stop and ask: does this make the live demo better in the next 60 seconds of judge attention? If not, cut it.

## 4. Architecture

```
fraud-detection-project/
├── backend/
│   ├── data_prep.py        # Load PaySim, sample, clean
│   ├── feature_engineering.py  # Build behavioral features per account
│   ├── train_model.py      # Isolation Forest training + scoring
│   ├── graph_builder.py     # NetworkX graph + fraud pattern detectors
│   ├── main.py              # FastAPI app serving precomputed JSON
│   └── requirements.txt
├── frontend/
│   ├── (React app — see frontend/SETUP.md)
├── data/
│   ├── raw/                 # PaySim CSV goes here
│   └── processed/            # risk_scores.json, graph.json land here
└── docs/
    ├── PRD.md
    ├── DATA_SCHEMA.md
    ├── ML_APPROACH.md
    ├── DEMO_SCRIPT.md
    └── TASK_BREAKDOWN.md
```

## 5. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Data | PaySim synthetic dataset (Kaggle) | Pre-labeled fraud column, no data collection needed |
| ML | scikit-learn IsolationForest | Fast to train, no GPU, easily explainable |
| Graph | NetworkX (backend) + vis-network.js (frontend) | NetworkX for pattern detection logic, vis-network for the visual "wow" |
| Backend | FastAPI | Minimal boilerplate, auto docs, fast to stand up |
| Frontend | React + vis-network.js | Component reuse, vis-network has built-in physics layout that looks great instantly |

## 6. The 6-Hour Plan

See `docs/TASK_BREAKDOWN.md` for the minute-by-minute plan. High level:

| Phase | Time | Deliverable |
|---|---|---|
| 1. Setup & Data | 0:00–0:30 | Sampled, cleaned dataset loaded |
| 2. ML Risk Scoring | 0:30–2:00 | `risk_scores.json` with explainable scores |
| 3. Graph Engine | 2:00–3:30 | `graph.json` with 2-3 curated fraud rings |
| 4. Frontend Dashboard | 3:30–5:00 | Working leaderboard + graph view + explain panel |
| 5. Polish & Pitch | 5:00–6:00 | Rehearsed demo, README, submission |

## 7. Success Criteria (how we know we're winning)

- [ ] Model produces risk scores that visibly separate fraud from non-fraud (validate against PaySim's `isFraud` labels — even just a confusion matrix/precision number for the pitch)
- [ ] At least 2 fraud rings are visually obvious in the graph (clear circular or fan-in/fan-out shape)
- [ ] Clicking any flagged node shows a clear, human-readable reason
- [ ] Demo runs with zero live computation risk — everything judge-facing is precomputed and just rendered
- [ ] Pitch fits in 90 seconds, demo fits in 2 minutes, total under 3 minutes before Q&A

## 8. Team Roles (suggested split for parallel work)

- **ML person**: `data_prep.py` → `feature_engineering.py` → `train_model.py`
- **Graph/backend person**: `graph_builder.py` → `main.py` (can start as soon as data schema is agreed, doesn't need to wait for model)
- **Frontend person**: Can start building the dashboard shell + vis-network integration against *mock* JSON immediately (see `docs/DATA_SCHEMA.md`), then swap in real data later
- **Everyone**: Demo script rehearsal in the last 30 minutes, no exceptions

This parallelization is the only way 6 hours works — nobody should be blocked waiting on someone else past the first 30 minutes.
