"""
main.py — FastAPI app serving precomputed risk scores and graph data.

Run: uvicorn main:app --reload --port 8000
Then visit http://localhost:8000/docs for the interactive API explorer.

All endpoints read from already-computed JSON files. No live model inference
happens here — this is deliberate, see docs/PRD.md "Risks & Mitigations".
"""

import json
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="TrailScope API")

# Allow the React dev server to call this API during the hackathon — fine to leave wide open
# for a local demo, just don't ship this CORS config anywhere real.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

RISK_SCORES_PATH = "../data/processed/risk_scores.json"
GRAPH_PATH = "../data/processed/graph.json"


def load_json(path):
    if not os.path.exists(path):
        raise HTTPException(status_code=503, detail=f"Data not ready: {path} missing. Run the pipeline scripts first.")
    with open(path) as f:
        return json.load(f)


@app.get("/api/accounts")
def get_accounts(sort: str = "riskScore", order: str = "desc"):
    accounts = load_json(RISK_SCORES_PATH)
    reverse = order == "desc"
    try:
        accounts = sorted(accounts, key=lambda a: a.get(sort, 0), reverse=reverse)
    except (KeyError, TypeError):
        pass  # if sort field is invalid, just return unsorted rather than erroring out mid-demo
    return accounts


@app.get("/api/accounts/{account_id}")
def get_account(account_id: str):
    accounts = load_json(RISK_SCORES_PATH)
    for a in accounts:
        if a["accountId"] == account_id:
            return a
    raise HTTPException(status_code=404, detail="Account not found")


@app.get("/api/graph")
def get_graph():
    return load_json(GRAPH_PATH)


@app.get("/api/graph/{account_id}")
def get_subgraph(account_id: str):
    graph = load_json(GRAPH_PATH)
    neighbor_ids = {account_id}
    for edge in graph["edges"]:
        if edge["from"] == account_id:
            neighbor_ids.add(edge["to"])
        if edge["to"] == account_id:
            neighbor_ids.add(edge["from"])

    nodes = [n for n in graph["nodes"] if n["id"] in neighbor_ids]
    edges = [e for e in graph["edges"] if e["from"] in neighbor_ids and e["to"] in neighbor_ids]
    return {"nodes": nodes, "edges": edges, "highlightedRings": graph.get("highlightedRings", [])}


@app.get("/api/rings")
def get_rings():
    graph = load_json(GRAPH_PATH)
    return graph.get("highlightedRings", [])


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "risk_scores_ready": os.path.exists(RISK_SCORES_PATH),
        "graph_ready": os.path.exists(GRAPH_PATH),
    }
