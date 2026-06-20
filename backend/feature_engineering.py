"""
feature_engineering.py — Build account-level behavioral features from transactions.

Run: python feature_engineering.py
Output: data/processed/account_features.csv
Expect to see: "Saved features for N accounts to data/processed/account_features.csv"

Builds 5 features per account (see docs/ML_APPROACH.md for rationale):
1. velocity        — transactions per unit time
2. amount_zscore    — how unusual this account's transaction amounts are vs itself
3. balance_mismatch — discrepancy between stated amount and actual balance change
4. relay_speed      — how fast funds get forwarded after being received (lower = more suspicious)
5. fan_ratio        — ratio of unique counterparties out vs in (mule account signature)
"""

import pandas as pd
import numpy as np
import os

IN_PATH = "../data/processed/sampled_transactions.csv"
OUT_PATH = "../data/processed/account_features.csv"


def compute_features(df: pd.DataFrame) -> pd.DataFrame:
    # Treat each account as either sender (nameOrig) or receiver (nameDest);
    # build features from both roles combined.

    sent = df.groupby("nameOrig").agg(
        sent_count=("amount", "count"),
        sent_mean=("amount", "mean"),
        sent_std=("amount", "std"),
        sent_total=("amount", "sum"),
        sent_unique_counterparties=("nameDest", "nunique"),
        first_step_sent=("step", "min"),
        last_step_sent=("step", "max"),
    ).reset_index().rename(columns={"nameOrig": "accountId"})

    received = df.groupby("nameDest").agg(
        recv_count=("amount", "count"),
        recv_mean=("amount", "mean"),
        recv_total=("amount", "sum"),
        recv_unique_counterparties=("nameOrig", "nunique"),
        first_step_recv=("step", "min"),
        last_step_recv=("step", "max"),
    ).reset_index().rename(columns={"nameDest": "accountId"})

    features = pd.merge(sent, received, on="accountId", how="outer").fillna(0)

    # 1. Velocity: total transactions (sent+received) over the observed time window
    features["total_txns"] = features["sent_count"] + features["recv_count"]
    time_span = (
        features[["first_step_sent", "first_step_recv"]].min(axis=1).replace(0, np.nan)
    )
    features["velocity"] = features["total_txns"] / (
        (features[["last_step_sent", "last_step_recv"]].max(axis=1) - time_span).clip(lower=1)
    )
    features["velocity"] = features["velocity"].fillna(0)

    # 2. Amount z-score proxy: sent_std relative to sent_mean (coefficient of variation)
    #    High variation = inconsistent transaction sizes = more anomalous behavior
    features["amount_zscore"] = (features["sent_std"] / features["sent_mean"].replace(0, np.nan)).fillna(0)

    # 3. Balance mismatch: compute separately per-transaction in a real pass;
    #    here we approximate at account level using sent vs received totals imbalance
    features["balance_mismatch"] = (features["sent_total"] - features["recv_total"]).abs()

    # 4. Relay speed: time between first receipt and first send (lower = faster relay = more suspicious)
    features["relay_speed"] = (features["first_step_sent"] - features["first_step_recv"]).clip(lower=0)
    # Invert so HIGHER feature value = MORE suspicious (consistent direction for all features)
    max_relay = features["relay_speed"].max() or 1
    features["relay_speed_score"] = max_relay - features["relay_speed"]

    # 5. Fan ratio: many unique counterparties out vs in = mule pattern
    features["fan_ratio"] = features["sent_unique_counterparties"] / (
        features["recv_unique_counterparties"].replace(0, 1)
    )

    final_cols = [
        "accountId", "velocity", "amount_zscore", "balance_mismatch",
        "relay_speed_score", "fan_ratio", "total_txns", "sent_total", "recv_total",
    ]
    return features[final_cols]


if __name__ == "__main__":
    if not os.path.exists(IN_PATH):
        raise FileNotFoundError(f"Run data_prep.py first — expected {IN_PATH}")

    df = pd.read_csv(IN_PATH)
    feats = compute_features(df)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    feats.to_csv(OUT_PATH, index=False)
    print(f"Saved features for {len(feats)} accounts to {OUT_PATH}")
