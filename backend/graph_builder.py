"""
graph_builder.py — Build the transaction graph and detect fraud-ring patterns.

Run: python graph_builder.py
Output: data/processed/graph.json
Expect to see: "Saved graph with N nodes, M edges, and K highlighted rings"

After running, MANUALLY INSPECT the printed highlighted rings — pick the 2-3
clearest ones for the demo. Messy/unclear rings should be left in the full graph
but NOT included in highlightedRings (which drives the default demo view).
"""

import pandas as pd
import networkx as nx
import json
import os

TRANSACTIONS_PATH = "../data/processed/sampled_transactions.csv"
RISK_SCORES_PATH = "../data/processed/risk_scores.json"
OUT_PATH = "../data/processed/graph.json"

MAX_RING_LENGTH = 5  # don't search for cycles longer than this — keeps detection fast and rings demo-able


def build_graph(txn_df: pd.DataFrame) -> nx.DiGraph:
    G = nx.DiGraph()
    for _, row in txn_df.iterrows():
        G.add_edge(
            row["nameOrig"],
            row["nameDest"],
            amount=row["amount"],
            txn_type=row["type"],
            step=row["step"],
        )
    return G


def detect_circular_flows(G: nx.DiGraph, max_length=MAX_RING_LENGTH) -> list:
    """Find simple cycles up to max_length — these are circular money flows."""
    rings = []
    try:
        cycles = list(nx.simple_cycles(G, length_bound=max_length))
    except TypeError:
        # older networkx versions don't support length_bound; filter manually
        cycles = [c for c in nx.simple_cycles(G) if len(c) <= max_length]

    for i, cycle in enumerate(cycles[:20]):  # cap how many we even consider
        if len(cycle) >= 3:  # a 2-node "cycle" (A pays B, B pays A) is less interesting
            rings.append({
                "ringId": f"circular_{i}",
                "type": "circular_flow",
                "accountIds": cycle,
                "description": f"Funds cycled through {len(cycle)} accounts and returned to origin",
            })
    return rings


def detect_fan_out(G: nx.DiGraph, min_fanout=4) -> list:
    """Find accounts that send to many distinct accounts in a short window — mule signature."""
    rings = []
    for node in G.nodes():
        out_edges = list(G.out_edges(node, data=True))
        if len(out_edges) >= min_fanout:
            targets = [e[1] for e in out_edges]
            rings.append({
                "ringId": f"fanout_{node}",
                "type": "fan_out",
                "accountIds": [node] + targets,
                "description": f"Account distributed funds to {len(targets)} different accounts in a short window",
            })
    return rings


def detect_rapid_relay(G: nx.DiGraph, max_step_gap=2) -> list:
    """Find A->B->C chains where B forwards funds almost immediately after receiving."""
    rings = []
    count = 0
    for b in G.nodes():
        in_edges = list(G.in_edges(b, data=True))
        out_edges = list(G.out_edges(b, data=True))
        for in_e in in_edges:
            for out_e in out_edges:
                gap = out_e[2]["step"] - in_e[2]["step"]
                if 0 <= gap <= max_step_gap:
                    rings.append({
                        "ringId": f"relay_{count}",
                        "type": "rapid_relay",
                        "accountIds": [in_e[0], b, out_e[1]],
                        "description": (
                            f"Received funds and forwarded {out_e[2]['amount']:.0f} "
                            f"within {gap} time step(s)"
                        ),
                    })
                    count += 1
                    if count >= 20:  # cap, we only need a few good examples
                        return rings
    return rings


def load_risk_scores() -> dict:
    if not os.path.exists(RISK_SCORES_PATH):
        print("WARNING: risk_scores.json not found — graph nodes will have no risk data. Run train_model.py first.")
        return {}
    with open(RISK_SCORES_PATH) as f:
        records = json.load(f)
    return {r["accountId"]: r for r in records}


def export_graph(G: nx.DiGraph, rings: list, risk_lookup: dict):
    nodes = []
    for node in G.nodes():
        risk = risk_lookup.get(node, {})
        nodes.append({
            "id": node,
            "label": node,
            "riskScore": risk.get("riskScore", 0),
            "riskTier": risk.get("riskTier", "low"),
            "group": "ungrouped",
        })

    edges = []
    for i, (u, v, data) in enumerate(G.edges(data=True)):
        edges.append({
            "id": f"txn_{i}",
            "from": u,
            "to": v,
            "amount": data["amount"],
            "type": data["txn_type"],
        })

    # Tag nodes that belong to a highlighted ring with the ring's group id
    node_lookup = {n["id"]: n for n in nodes}
    for ring in rings:
        for acc_id in ring["accountIds"]:
            if acc_id in node_lookup:
                node_lookup[acc_id]["group"] = ring["ringId"]

    output = {
        "nodes": nodes,
        "edges": edges,
        "highlightedRings": [
            {
                "ringId": r["ringId"],
                "label": r["type"].replace("_", " ").title(),
                "accountIds": r["accountIds"],
                "description": r["description"],
            }
            for r in rings
        ],
    }

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(output, f, indent=2)

    print(f"Saved graph with {len(nodes)} nodes, {len(edges)} edges, and {len(rings)} highlighted rings")
    print("\n--- INSPECT THESE RINGS, PICK 2-3 BEST FOR THE DEMO ---")
    for r in rings[:10]:
        print(f"  [{r['type']}] {r['ringId']}: {r['description']} | accounts: {r['accountIds']}")


if __name__ == "__main__":
    if not os.path.exists(TRANSACTIONS_PATH):
        raise FileNotFoundError("Run data_prep.py first")

    txn_df = pd.read_csv(TRANSACTIONS_PATH)
    G = build_graph(txn_df)

    rings = []
    rings += detect_circular_flows(G)
    rings += detect_rapid_relay(G)
    rings += detect_fan_out(G)

    risk_lookup = load_risk_scores()
    export_graph(G, rings, risk_lookup)
