# Frontend Setup

## Quick Start

```bash
npm create vite@latest . -- --template react
npm install
npm install vis-network vis-data
npm run dev
```

(`vite` is faster to scaffold than create-react-app for a time-boxed hackathon — no need to debate this, just use it.)

## Suggested file structure

```
frontend/src/
├── mockData.js           # matches docs/DATA_SCHEMA.md exactly — build against this first
├── api.js                 # fetch wrappers for /api/accounts, /api/graph, etc — swap mock for these later
├── App.jsx                 # top-level layout: 3-column shell
├── components/
│   ├── RiskLeaderboard.jsx  # left column: sortable account list
│   ├── GraphView.jsx         # center: vis-network canvas
│   ├── AccountDetailPanel.jsx # right: slides in on node click
│   └── SearchBar.jsx
└── styles/
    └── tokens.css            # design tokens from docs/FRONTEND_DESIGN_NOTES.md
```

## Build order (matches docs/TASK_BREAKDOWN.md Workstream C)

1. Scaffold + install deps (5 min)
2. `mockData.js` — copy the exact JSON shapes from `docs/DATA_SCHEMA.md`, write 4-5 fake accounts and 1 fake ring
3. `tokens.css` — set up the CSS variables from `docs/FRONTEND_DESIGN_NOTES.md` first, before building components, so every component you write from here on already looks right
4. `App.jsx` — three-column flex/grid layout shell, no real data yet, just the structure
5. `RiskLeaderboard.jsx` — render mock accounts sorted by riskScore, color-coded by riskTier
6. `GraphView.jsx` — get vis-network rendering mock nodes/edges first (this is the highest-risk integration point, get it working early even with fake data)
7. `AccountDetailPanel.jsx` — click-through from leaderboard or graph node opens this with mock account's `flaggedReasons`
8. `SearchBar.jsx` — filter the leaderboard / jump the graph view to a searched account ID
9. Once backend is live: build `api.js`, swap mock imports for real fetch calls component by component

## vis-network quick reference

```jsx
import { Network } from 'vis-network';
import { DataSet } from 'vis-data';

const nodes = new DataSet(graphData.nodes.map(n => ({
  id: n.id,
  label: n.label,
  color: riskTierToColor(n.riskTier), // see tokens.css for the hex values
  size: 15 + (n.riskScore / 100) * 25, // scale node size by risk — see FRONTEND_DESIGN_NOTES.md
})));

const edges = new DataSet(graphData.edges.map(e => ({
  from: e.from,
  to: e.to,
  width: 1 + Math.log10(e.amount + 1), // scale edge thickness by amount
  arrows: 'to',
})));

const network = new Network(containerRef.current, { nodes, edges }, {
  physics: { stabilization: { iterations: 100 } }, // let it settle visibly on load
  nodes: { shape: 'dot', font: { color: '#E6E9EF', face: 'IBM Plex Mono' } },
  edges: { color: { color: '#7B879C' }, smooth: { type: 'continuous' } },
});

network.on('click', (params) => {
  if (params.nodes.length > 0) {
    onNodeSelected(params.nodes[0]); // wire this to open AccountDetailPanel
  }
});
```

## Don't forget

- Default-load the graph view centered on `highlightedRings[0]`, not the full unfiltered graph — see `docs/DATA_SCHEMA.md` section 2. A full graph of thousands of nodes looks like a hairball and undermines the "clarity" pitch.
- Every color choice should reference `docs/FRONTEND_DESIGN_NOTES.md` tokens — don't improvise new colors mid-build, it'll drift from the intended aesthetic.
