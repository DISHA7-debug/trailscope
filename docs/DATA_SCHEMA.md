# Data Schema Contract

This file is the integration contract between backend and frontend. **Build against this from minute 30, in parallel — don't wait for the real pipeline.** Frontend can hardcode a mock JSON matching this exact shape and swap in the real API response later with zero code changes.

## 1. `risk_scores.json`

Array of scored accounts.

```json
[
  {
    "accountId": "C1231006815",
    "riskScore": 87,
    "riskTier": "high",
    "flaggedReasons": [
      "Rapid fund relay: received ₹240000, forwarded ₹238500 within 3 minutes",
      "Transaction amount 12x higher than account's historical average"
    ],
    "totalTransactions": 14,
    "totalVolume": 1820000,
    "isFraudGroundTruth": true
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `accountId` | string | Matches PaySim's `nameOrig`/`nameDest` IDs |
| `riskScore` | number (0-100) | Higher = more suspicious |
| `riskTier` | "low" \| "medium" \| "high" | Derived from score thresholds (e.g. <40 low, 40-70 medium, >70 high) — frontend uses this for color, not raw score, so thresholds can be tuned backend-side without frontend changes |
| `flaggedReasons` | string[] | Plain-language explanations, pre-written by backend. This is what renders in the "why flagged" panel. Empty array if not flagged. |
| `totalTransactions` | number | For display in account detail panel |
| `totalVolume` | number | Sum of transaction amounts, for display |
| `isFraudGroundTruth` | boolean | From PaySim's labeled data — used internally to validate the model, **not required to display in the UI**, but useful for an internal "accuracy" stat in the pitch |

## 2. `graph.json`

Defines the network for vis-network.js. Two top-level keys: `nodes` and `edges`.

```json
{
  "nodes": [
    {
      "id": "C1231006815",
      "label": "C1231006815",
      "riskScore": 87,
      "riskTier": "high",
      "group": "ring_1"
    }
  ],
  "edges": [
    {
      "id": "txn_001",
      "from": "C1231006815",
      "to": "C1900366749",
      "amount": 238500,
      "timestamp": "2024-01-01T10:03:00Z",
      "type": "TRANSFER"
    }
  ],
  "highlightedRings": [
    {
      "ringId": "ring_1",
      "label": "Circular Flow Ring",
      "accountIds": ["C1231006815", "C1900366749", "C1666544295"],
      "description": "Funds cycled through 3 accounts and returned to origin within 12 minutes"
    }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `nodes[].group` | string | Used by vis-network to visually cluster known fraud rings vs. ungrouped accounts |
| `edges[].type` | "TRANSFER" \| "CASH_OUT" \| "PAYMENT" \| "DEBIT" \| "CASH_IN" | Maps to PaySim's transaction types — can drive edge styling (e.g., dashed for CASH_OUT) |
| `highlightedRings` | array | **This is what powers the guaranteed-good demo.** Pre-identified, hand-verified fraud patterns. Frontend should default-load the graph centered on `highlightedRings[0]` rather than the full (messy) graph. |

## 3. API Endpoints (FastAPI, served from `backend/main.py`)

| Endpoint | Method | Returns |
|---|---|---|
| `/api/accounts` | GET | Full `risk_scores.json` contents, optionally `?sort=riskScore&order=desc` |
| `/api/accounts/{accountId}` | GET | Single account object from `risk_scores.json` |
| `/api/graph` | GET | Full `graph.json` contents |
| `/api/graph/{accountId}` | GET | Subgraph: the queried account + its direct neighbors (1-hop), same shape as `graph.json` |
| `/api/rings` | GET | Just the `highlightedRings` array — frontend's default landing view |

All endpoints read from precomputed JSON files in `data/processed/` — **no live model inference behind any endpoint.** This is a deliberate reliability choice for the demo.

## 4. Mock Data for Frontend-First Development

Frontend teammate: create `frontend/src/mockData.js` exporting objects matching the shapes above (3-5 fake accounts, one fake ring) so you can build and style the UI immediately without waiting on the backend. Switch the data source from the mock to `fetch('/api/...')` calls once backend endpoints are live — if you've matched the schema, this should be a one-line change per component.
