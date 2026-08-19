# Roast & Row — Small-Batch Roast Log

A single-page specialty coffee storefront for a fictional roastery that publishes
roast data like a lab publishes results. Every lot shows origin, process,
elevation, cupping score, and its position on a 270° **roast dial** — the
signature element that recurs as hero illustration, per-product indicator, and
the filter control itself.

## Stack

- **Vite + React 18** (TypeScript)
- **Tailwind CSS v4** — the six brand tokens and three font roles live in `@theme` (`src/index.css`); no hex values in components
- **State** — Context API (cart + drawer), plain `useState` for filters
- **Data** — local `src/data/products.json` (10 lots, no API)
- **Fonts** — Fraunces (display) / Inter (body) / IBM Plex Mono (every number on the page)

## Tokens

| Token | Hex | Role |
| --- | --- | --- |
| Ink | `#1B1712` | Primary background |
| Parchment | `#EFE6D6` | Light sections / text on Ink |
| Cascara | `#B23A2E` | CTAs, dial needle, prices, active filters |
| Green Coffee | `#6B7A4F` | Light-roast dial band, success state |
| Char | `#4A3F36` | Borders, dividers |
| Smoke | `#8C8275` | Muted text |

## Features

- **Roast dial** (`RoastDial.tsx`) — one SVG component at three scales: 800 ms
  ease-out sweep in the hero, static marker on every card, click-a-band filter
  control in the sticky sidebar (hub resets to *all*)
- **Filters** — roast dial + keyboard-accessible chips, dual-thumb price range
  ($14–26, Plex Mono readout), native sort select; applied instantly, no
  “apply” button; filtered-out cards fade + collapse over 200 ms
- **Cart** — Context API, add / remove / quantity steppers, running total in
  large Plex Mono, persisted to `localStorage` (`roast-and-row.cart.v1`),
  rehydrated on load, Fraunces-italic empty state
- **Drawer** — right slide-out on Ink with scrim, 250 ms slide + fade, Escape /
  scrim / button to close, body scroll lock
- **Motion** — hero dial sweep (once), self-drawing roast-curve backdrop, lot
  ticker, scroll reveals, 2 px card hover lift, badge pop — all disabled or
  near-instant under `prefers-reduced-motion`
- **Polish** — skeleton loader on boot, filter empty state with reset, sticky
  filter rail on desktop that stacks above the grid on mobile (3 → 2 → 1 columns)

## Run it

```bash
npm install
npm run dev       # local dev
npm run build     # production build → dist/
```

## Deploy

Static build — point Vercel or Netlify at the repo with build command
`npm run build` and output directory `dist`. No environment variables required.

## Demo flow (for the GIF)

Load → hero dial sweeps to 62° → click the **dark** band on the sidebar dial →
cards fade/collapse to three lots → add *Kerinci Ayu* twice → open the drawer →
adjust quantity → refresh the page → cart rehydrates.

## Credits

Product photography generated with a single fixed flat-lay prompt template
(parchment backdrop, bag + beans at matching roast color) so all ten lots share
one visual style. No payments, no backend, no beans were harmed.
