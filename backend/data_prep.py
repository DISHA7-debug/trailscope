"""
data_prep.py — Load PaySim, stratify-sample, save a workable subset.

Run: python data_prep.py
Output: data/processed/sampled_transactions.csv
Expect to see: "Saved N rows (X fraud, Y non-fraud) to data/processed/sampled_transactions.csv"

WHY stratified sampling: PaySim's fraud rate is tiny (~0.1% of rows). A pure random
sample of 5k-10k rows would likely contain almost no fraud examples, which kills
both model training and the demo (no fraud rings to show). We force-include all
fraud rows, then top up with random non-fraud rows to hit the target size.
"""

import pandas as pd
import os

RAW_PATH = "../data/raw/paysim.csv"
OUT_PATH = "../data/processed/sampled_transactions.csv"
TARGET_SIZE = 8000  # tune down to 5000 if the pipeline feels slow anywhere downstream
RANDOM_SEED = 42


def load_and_sample():
    if not os.path.exists(RAW_PATH):
        raise FileNotFoundError(
            f"Expected PaySim CSV at {RAW_PATH}. Download it from Kaggle "
            f"(search 'PaySim synthetic financial dataset') and place it there."
        )

    print("Loading raw PaySim data...")
    df = pd.read_csv(RAW_PATH)

    fraud_rows = df[df["isFraud"] == 1]
    non_fraud_rows = df[df["isFraud"] == 0]

    n_fraud = len(fraud_rows)
    n_nonfraud_needed = max(TARGET_SIZE - n_fraud, 0)

    non_fraud_sample = non_fraud_rows.sample(
        n=min(n_nonfraud_needed, len(non_fraud_rows)),
        random_state=RANDOM_SEED,
    )

    sampled = pd.concat([fraud_rows, non_fraud_sample]).sample(
        frac=1, random_state=RANDOM_SEED  # shuffle
    ).reset_index(drop=True)

    os.makedirs(os.path.dirname(OUT_PATH), exist_ok=True)
    sampled.to_csv(OUT_PATH, index=False)

    print(
        f"Saved {len(sampled)} rows "
        f"({n_fraud} fraud, {len(non_fraud_sample)} non-fraud) to {OUT_PATH}"
    )
    return sampled


if __name__ == "__main__":
    load_and_sample()
