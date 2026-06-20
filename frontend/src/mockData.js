// mockData.js — matches docs/DATA_SCHEMA.md exactly.
// Build the entire frontend against this first. Swap for real `fetch('/api/...')`
// calls once the backend is live (see frontend/SETUP.md step 9) — if the shapes
// match, this should be close to a one-line change per component.

export const mockAccounts = [
  {
    accountId: "C1231006815",
    riskScore: 87,
    riskTier: "high",
    flaggedReasons: [
      "Rapid fund relay — money forwarded shortly after being received",
      "Funds distributed to many more accounts than received from — possible mule pattern",
    ],
    totalTransactions: 14,
    totalVolume: 1820000,
    isFraudGroundTruth: true,
  },
  {
    accountId: "C1900366749",
    riskScore: 81,
    riskTier: "high",
    flaggedReasons: [
      "Highly inconsistent transaction amounts — large swings between transactions",
    ],
    totalTransactions: 9,
    totalVolume: 980000,
    isFraudGroundTruth: true,
  },
  {
    accountId: "C1666544295",
    riskScore: 74,
    riskTier: "high",
    flaggedReasons: [
      "Mismatch between transaction amounts and account balance changes",
    ],
    totalTransactions: 11,
    totalVolume: 1120000,
    isFraudGroundTruth: false,
  },
  {
    accountId: "C2049700087",
    riskScore: 52,
    riskTier: "medium",
    flaggedReasons: ["Unusually high transaction frequency relative to other accounts"],
    totalTransactions: 6,
    totalVolume: 340000,
    isFraudGroundTruth: false,
  },
  {
    accountId: "C9082716341",
    riskScore: 18,
    riskTier: "low",
    flaggedReasons: [],
    totalTransactions: 3,
    totalVolume: 45000,
    isFraudGroundTruth: false,
  },
];

export const mockGraph = {
  nodes: [
    { id: "C1231006815", label: "C1231006815", riskScore: 87, riskTier: "high", group: "circular_0" },
    { id: "C1900366749", label: "C1900366749", riskScore: 81, riskTier: "high", group: "circular_0" },
    { id: "C1666544295", label: "C1666544295", riskScore: 74, riskTier: "high", group: "circular_0" },
    { id: "C2049700087", label: "C2049700087", riskScore: 52, riskTier: "medium", group: "ungrouped" },
    { id: "C9082716341", label: "C9082716341", riskScore: 18, riskTier: "low", group: "ungrouped" },
  ],
  edges: [
    { id: "txn_001", from: "C1231006815", to: "C1900366749", amount: 238500, type: "TRANSFER" },
    { id: "txn_002", from: "C1900366749", to: "C1666544295", amount: 230000, type: "TRANSFER" },
    { id: "txn_003", from: "C1666544295", to: "C1231006815", amount: 225000, type: "TRANSFER" },
    { id: "txn_004", from: "C2049700087", to: "C9082716341", amount: 45000, type: "PAYMENT" },
  ],
  highlightedRings: [
    {
      ringId: "circular_0",
      label: "Circular Flow Ring",
      accountIds: ["C1231006815", "C1900366749", "C1666544295"],
      description: "Funds cycled through 3 accounts and returned to origin within 12 minutes",
    },
  ],
};
