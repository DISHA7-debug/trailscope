# Frontend Design Notes — Investigation Console Aesthetic

## Why this matters

Most hackathon teams ship a generic admin-panel look (white background, blue accent, Bootstrap defaults) because they run out of time. A deliberately designed "investigation console" feel costs almost nothing extra if you set the tokens below upfront, and it visibly signals polish to judges in the first 3 seconds of the demo — before they've even processed what the product does.

## Design Direction: "Dark Ops Console"

Think: the screen a financial crimes unit would actually use at 2am — dark, focused, data-dense but not cluttered, with risk signals that pop via color rather than decoration.

### Color tokens

| Token | Hex | Use |
|---|---|---|
| `--bg-primary` | `#0B0E14` | Main background, near-black with a slight blue tint |
| `--bg-panel` | `#131822` | Card/panel backgrounds, slightly lighter than primary |
| `--border-subtle` | `#232A38` | Hairline borders between panels |
| `--text-primary` | `#E6E9EF` | Main text |
| `--text-muted` | `#7B879C` | Secondary text, labels |
| `--risk-low` | `#3DDC84` | Green — low risk nodes/badges |
| `--risk-medium` | `#F5A623` | Amber — medium risk |
| `--risk-high` | `#FF4757` | Red — high risk, the color that should draw the eye |
| `--accent` | `#4D9FFF` | Selected state, links, focus rings |

### Typography

- **Display/headers:** A monospace or semi-monospace face (e.g., "JetBrains Mono", "IBM Plex Mono", or system `ui-monospace`) for account IDs, scores, and headers — reinforces the "terminal/console" feel and is genuinely appropriate since account IDs and scores are technical data, not editorial copy.
- **Body/UI text:** A clean sans (e.g., "Inter", "IBM Plex Sans", or system default) for labels, explanations, buttons — keep these readable, don't monospace prose.
- Numbers (risk scores especially) should be large and tabular-aligned where they appear in lists, so they visually compare at a glance.

### Layout concept

```
┌─────────────────────────────────────────────────────────┐
│  TRAILSCOPE          [search account ID...]      ● live  │ ← header bar, monospace logo
├───────────────┬───────────────────────────┬─────────────┤
│  RISK LEDGER  │                           │  ACCOUNT    │
│               │                           │  DETAIL     │
│  C123... 87🔴 │                           │             │
│  C456... 72🟠 │      [ graph canvas ]      │  (hidden    │
│  C789... 65🟠 │                           │  until a    │
│  ...          │                           │  node is    │
│               │                           │  clicked)   │
└───────────────┴───────────────────────────┴─────────────┘
```

- Three-column layout: leaderboard (left, ~20% width) | graph (center, ~55%) | detail panel (right, ~25%, slides/fades in on selection)
- No border-radius above 4-6px anywhere — sharp, console-like, not bubbly/consumer-app
- Risk tier shows as both color AND a small icon/badge (never rely on color alone — also just looks more deliberate)

### The signature element

The graph itself, rendered with vis-network's physics-based layout, IS the signature element. Lean into it:
- High-risk nodes should be visibly larger (scale node size by riskScore, not just color) — this makes the fraud ring pop out spatially, not just chromatically
- Use a subtle glow/shadow effect (CSS `filter: drop-shadow()` or vis-network's built-in shadow option) on high-risk nodes — reinforces "this is the dangerous one" without needing a legend
- Edge thickness scaled by transaction amount — bigger money flows look like bigger lines, which is intuitively readable with zero explanation needed

### Motion (use sparingly)

- On initial load, let vis-network's physics simulation visibly settle for ~1-2 seconds (don't disable physics animation) — it looks alive and is genuinely satisfying to watch, this is a free "wow" moment
- Side panel slides in (200-300ms ease) rather than appearing instantly
- That's it — don't add more animation than this, it'll read as trying too hard rather than polished

### What to avoid

- Default Bootstrap/Material Design components unstyled
- Light backgrounds with pastel accent colors (reads as a generic SaaS dashboard, not an investigation tool)
- Pie charts or generic bar charts as decoration — every visual element should carry real information
- Rounded, friendly, consumer-app styling (large border-radius, soft shadows, playful icons) — this is a serious tool, the aesthetic should communicate competence and focus
