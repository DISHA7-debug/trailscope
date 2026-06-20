# Landing Page

Premium Awwwards-style marketing landing for TrailScope.

## Quick Start

Serve the `frontend/` folder with any static server:

```bash
cd frontend
npx serve .
# or: python -m http.server 3000
```

Open `http://localhost:3000` in your browser.

## File Structure

```
frontend/
├── index.html          # All 8 sections + loader
├── css/
│   ├── main.css        # Design tokens, layout, components
│   └── animations.css  # Reveal utilities, glass shimmer
├── js/
│   ├── main.js         # Loader, particles, spotlight
│   ├── cursor.js       # Custom cursor + magnetic buttons
│   ├── scroll.js       # Lenis, GSAP ScrollTrigger, counters
│   └── spline.js       # Spline 3D scenes (hero + scroll)
├── src/
│   └── mockData.js     # Dashboard mock data (unchanged)
└── SETUP.md            # React dashboard setup (unchanged)
```

## Spline Scenes

Replace URLs in `js/spline.js` with your own exported `.splinecode` files:

```js
const SPLINE_HERO_URL = 'https://prod.spline.design/YOUR-SCENE/scene.splinecode';
const SPLINE_SCROLL_URL = 'https://prod.spline.design/YOUR-SCENE/scene.splinecode';
```

If Spline fails to load, a CSS animated ring fallback renders automatically.

## Stack

- Vanilla HTML / CSS / JS
- [GSAP](https://greensock.com/gsap/) + ScrollTrigger
- [Lenis](https://lenis.darkroom.engineering/) smooth scroll
- [Spline Runtime](https://www.npmjs.com/package/@splinetool/runtime)

## Dashboard App

The investigation console (React + vis-network) is documented in `SETUP.md`. Build it separately — this landing page does not replace the dashboard.
