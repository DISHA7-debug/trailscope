"""
train_model.py — Fit Isolation Forest on account features, export risk scores.

Run: python train_model.py
Output: data/processed/risk_scores.json
Expect to see: "Saved N risk-scored accounts. Validation precision @ high-risk tier: X%"

This is the file you'll quote a number from in the pitch — read the validation
print statement carefully and write it down for docs/DEMO_SCRIPT.md.
"""

import pandas as pd
import numpy as np
import json
import os
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler

FEATURES_PATH = "../data/processed/account_features.csv"
TRANSACTIONS_PATH = "../data/processed/sampled_transactions.csv"
OUT_PATH = "../data/processed/risk_scores.json"

FEATURE_COLS = ["velocity", "amount_zscore", "balance_mismatch", "relay_speed_score", "fan_ratio"]

EXPLANATION_TEMPLATES = {
    "velocity": "Unusually high transaction frequency relative to other accounts",
    "amount_zscore": "Highly inconsistent transaction amounts — large swings between transactions",
    "balance_mismatch": "Mismatch between transaction amounts and account balance changes",
    "relay_speed_score": "Rapid fund relay — money forwarded shortly after being received",
    "fan_ratio": "Funds distributed to many more accounts than received from — possible mule pattern",
}


def get_ground_truth_fraud_accounts(txn_df: pd.DataFrame) -> set:
    """Accounts involved (as sender or receiver) in at least one labeled fraud transaction."""
    fraud_txns = txn_df[txn_df["isFraud"] == 1]
    return set(fraud_txns["nameOrig"]).union(set(fraud_txns["nameDest"]))


def score_accounts(features: pd.DataFrame) -> pd.DataFrame:
    X = features[FEATURE_COLS].values
    X_scaled = StandardScaler().fit_transform(X)

    model = IsolationForest(contamination=0.05, random_state=42, n_estimators=200)
    model.fit(X_scaled)

    # decision_function: higher = more normal. Invert so higher = more suspicious.
    raw_scores = -model.decision_function(X_scaled)

    # Min-max normalize to 0-100
    min_s, max_s = raw_scores.min(), raw_scores.max()
    norm_scores = (raw_scores - min_s) / (max_s - min_s + 1e-9) * 100

    features = features.copy()
    features["riskScore"] = norm_scores.round(1)
    features["riskTier"] = pd.cut(
        features["riskScore"], bins=[-1, 40, 70, 101], labels=["low", "medium", "high"]
    )

    # Determine top contributing feature per account (highest scaled value) for explanations
    X_scaled_df = pd.DataFrame(X_scaled, columns=FEATURE_COLS, index=features.index)
    features["top_features"] = X_scaled_df[FEATURE_COLS].apply(
        lambda row: row.sort_values(ascending=False).index[:2].tolist(), axis=1
    )

    return features


def build_reasons(top_features: list) -> list:
    return [EXPLANATION_TEMPLATES[f] for f in top_features if f in EXPLANATION_TEMPLATES]


def validate(features: pd.DataFrame, fraud_accounts: set):
    high_risk = features[features["riskTier"] == "high"]
    if len(high_risk) == 0:
        print("WARNING: no accounts scored as high-risk. Consider raising `contamination`.")
        return

    flagged_set = set(high_risk["accountId"])
    true_positives = flagged_set.intersection(fraud_accounts)
    precision = len(true_positives) / len(flagged_set) * 100 if flagged_set else 0

    print(
        f"Validation: {len(high_risk)} accounts flagged high-risk, "
        f"{len(true_positives)} were confirmed fraud accounts. "
        f"Precision @ high-risk tier: {precision:.1f}%"
    )
    print(">>> Write this number down for docs/DEMO_SCRIPT.md <<<")


if __name__ == "__main__":
    if not os.path.exists(FEATURES_PATH):
        raise FileNotFoundError("Run feature_engineering.py first")

    features = pd.read_csv(FEATURES_PATH)
    txns = pd.read_csv(TRANSACTIONS_PATH)
    fraud_accounts = get_ground_truth_fraud_accounts(txns)

    scored = score_accounts(features)
    validate(scored, fraud_accounts)

    records = []
    for _, row in scored.iterrows():
        records.append({
            "accountId": row["accountId"],
            "riskScore": float(row["riskScore"]),
            "riskTier": str(row["riskTier"]),
            "flaggedReasons": build_reasons(row["top_features"]) if row["riskTier"] != "low" else [],
            "totalTransactions": int(row["total_txns"]),
            "totalVolume": float(row["sent_total"] + row["recv_total"]),
            "isFraudGroundTruth": row["accountId"] in fraud_accounts,
        })

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    with open(OUT_PATH, "w") as f:
        json.dump(records, f, indent=2)

    print(f"Saved {len(records)} risk-scored accounts to {OUT_PATH}")
