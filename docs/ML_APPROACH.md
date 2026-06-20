# ML Approach — Risk Scoring Model

## Goal

Produce a 0-100 risk score per account, with a plain-language reason, fast enough to compute once in under 90 minutes and defensible enough to explain confidently to judges.

## Dataset

**PaySim** (Kaggle: search "PaySim synthetic financial dataset"). Simulates mobile money transactions, includes a ground-truth `isFraud` column. Columns of interest:

| Column | Meaning |
|---|---|
| `step` | Time unit (1 step = 1 hour) |
| `type` | CASH_IN, CASH_OUT, DEBIT, PAYMENT, TRANSFER |
| `amount` | Transaction amount |
| `nameOrig` | Sender account ID |
| `oldbalanceOrg` / `newbalanceOrig` | Sender balance before/after |
| `nameDest` | Receiver account ID |
| `oldbalanceDest` / `newbalanceDest` | Receiver balance before/after |
| `isFraud` | Ground truth label (use for validation, and optionally as a feature-engineering sanity check — **not** as a direct training label, since we want to demo *unsupervised* anomaly detection as the core technique) |

**Sampling:** Take a random sample of 5,000-10,000 rows, but **stratify to oversample fraud cases** (PaySim fraud is a tiny fraction of all rows — if you take a pure random sample you may get too few fraud examples to build a compelling demo). E.g., take all fraud rows + a random sample of non-fraud rows to reach your target size.

## Why Isolation Forest (and not something fancier)

- Unsupervised — fits the "detect anomalies we haven't seen before" narrative better than a supervised classifier (which just memorizes known fraud patterns).
- Trains in seconds on this data size, no GPU, no hyperparameter search needed.
- Outputs an anomaly score that maps cleanly to a 0-100 risk score.
- Simple enough that any team member can explain it to a judge in one sentence: *"It learns what 'normal' transaction behavior looks like, and flags accounts that deviate the most."*

Don't reach for a GNN, deep autoencoder, or LSTM here — the time cost is not worth it for a 6-hour build, and a simpler model you can fully explain beats a complex one you can't defend under judge questioning.

## Feature Engineering (per account, aggregated from transactions)

Build these features per `accountId` (combine both sender and receiver role):

1. **Transaction velocity** — transactions per hour (using `step` as the time unit)
2. **Amount deviation** — z-score of each transaction amount vs. that account's own historical mean/std
3. **Balance mismatch** — difference between expected balance change (`amount`) and actual (`newbalance - oldbalance`); large mismatches are a PaySim-specific fraud signal
4. **Rapid relay window** — time (in `step` units) between an account receiving funds and forwarding them onward; short windows are suspicious
5. **Fan-in/fan-out ratio** — number of unique counterparties sending to this account vs. number it sends to

These 5 features are enough. Don't over-engineer the feature set — more features ≠ better demo, and each one adds debugging surface area.

## Model Pipeline (`backend/train_model.py`)

```
1. Load sampled data (from data_prep.py output)
2. Compute the 5 features per account (feature_engineering.py)
3. Scale features (StandardScaler)
4. Fit IsolationForest(contamination=0.05, random_state=42)
   - contamination=0.05 assumes ~5% of accounts are anomalous; tune if scores look off
5. Convert decision_function() output to a 0-100 scale (min-max normalize, invert sign so higher = more suspicious)
6. Bucket into riskTier: low (<40), medium (40-70), high (>70)
7. Generate flaggedReasons per account:
   - Check which of the 5 features are the biggest outliers for this account
   - Map each to a pre-written plain-language template (see below)
8. Validate: compare riskTier == "high" accounts against isFraud ground truth
   - Compute precision: of accounts we flagged high-risk, what % were actually fraud?
   - Have this number ready for the pitch — even ~60-70% precision is a legitimate, explainable result for an unsupervised model in this dataset
9. Export to data/processed/risk_scores.json
```

## Explanation Templates (map feature outliers to plain language)

| Feature outlier | Template |
|---|---|
| High transaction velocity | "Unusually high transaction frequency: {n} transactions in {window}" |
| High amount deviation | "Transaction amount {x}x higher than account's historical average" |
| Balance mismatch | "Balance change doesn't match transaction amount — possible data manipulation signal" |
| Fast relay | "Rapid fund relay: received ₹{amount}, forwarded ₹{amount2} within {time}" |
| High fan-out | "Funds distributed to {n} different accounts in a short window — mule account pattern" |

Pick the top 1-2 outlier features per account to generate `flaggedReasons` — don't list all 5 even if all are somewhat elevated, it dilutes the explanation.

## Validation Talking Point for Judges

Be ready to say something like: *"We validated our unsupervised model against PaySim's ground-truth fraud labels. Of the accounts our model flagged as high-risk, X% were confirmed fraud cases — without ever training directly on the fraud label itself."* This shows you understand the difference between supervised and unsupervised approaches and validated your work honestly.
