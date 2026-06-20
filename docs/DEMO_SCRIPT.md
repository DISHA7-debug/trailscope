# Demo Script — Judge Presentation

Target: 90 seconds pitch + 2 minutes live demo = under 3.5 minutes total, leaving room for Q&A.

## Opening (15 seconds) — the hook

> "Financial fraud investigators today trace money laundering manually — reading transaction logs, row by row, while the trail goes cold. We built TrailScope: an AI system that doesn't just flag suspicious transactions, it shows investigators the *shape* of the crime."

## Problem (20 seconds)

> "Existing fraud tools give you a table of flagged transactions. But fraud isn't a list — it's a network. Money moves through mule accounts, circles back, splits across dozens of receivers. A table can't show you that. A graph can."

## Solution (25 seconds)

> "TrailScope scores every account using unsupervised anomaly detection — it learns what normal transaction behavior looks like and flags what deviates, without ever being told what fraud looks like in advance. Then it renders the money trail as an interactive graph, so an investigator sees the fraud ring instantly instead of reconstructing it by hand."

## Live Demo (2 minutes) — script the clicks

1. **[Show leaderboard]** "Here's our risk ledger — accounts ranked by AI-generated risk score. This top account scored 87."
2. **[Click top account → graph centers on it]** "Clicking it shows its money trail. You can immediately see — this isn't a random network, it's a closed loop. Money goes from A to B to C and back to A."
3. **[Click the flagged node]** "And we don't just flag it — we explain it. [read the `flaggedReasons` text from the panel]. This is the kind of explanation an investigator can act on immediately, not a black-box score they have to trust blindly."
4. **[Optional: click a second example if time permits]** "Here's a different pattern — a fan-out, one account splitting funds across many receivers in minutes. Classic mule account behavior, and again, visually obvious the moment you see it."

## Close (15 seconds) — the impact line

> "We validated this against labeled fraud data — [insert your real precision number here] of our high-risk flags were confirmed fraud, without the model ever training on the fraud label directly. This is a tool that turns hours of manual tracing into seconds of visual pattern recognition."

---

## Q&A Prep — Likely Questions and Honest Answers

**"How does this scale to millions of real transactions?"**
> "For this prototype we sampled the dataset for demo speed, but the architecture — precomputed scoring batches, indexed graph queries — is the same pattern real fraud platforms use; you'd run scoring as a scheduled batch job rather than live per-transaction, which is exactly how production fraud systems already work."

**"Why Isolation Forest and not a graph neural network?"**
> "We chose an approach we could fully validate and explain in the time we had, rather than a more complex model we'd have to take on faith. Isolation Forest gave us an explainable, fast-to-train baseline — a GNN would be a natural next step with more time and labeled training data."

**"Is this using real bank data?"**
> "No — we used PaySim, a synthetic but realistic mobile-money dataset designed for fraud research, with labeled ground truth so we could actually validate our model's accuracy rather than just asserting it works."

**"What's the false positive rate / what happens to legitimate accounts flagged by mistake?"**
> "[Give your honest validation number]. In a real deployment, this score would route accounts to human review, not trigger automatic action — it's a triage tool that prioritizes investigator attention, not an automated judge."

**"What would you build next with more time?"**
> "Three things: real-time scoring instead of batch, a feedback loop where investigator decisions retrain the model, and extending the pattern detectors beyond the three we built — there are well-documented fraud topologies in the literature we didn't have time to implement."

## Rehearsal Checklist

- [ ] Run the full demo twice, start to finish, with the actual person who will click and the actual person who will talk
- [ ] Time it — if it's over 3.5 minutes, cut content, don't speed-talk
- [ ] Have a fallback: take a screen recording of the working demo in case of live wifi/laptop issues at presentation time
- [ ] Know your real validation number cold — don't make one up live, judges will ask follow-ups
