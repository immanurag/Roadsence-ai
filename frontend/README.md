# Urban Risk Intelligence — Frontend

React + Vite + Tailwind CSS v4 client for the UrbanRisk API. Five pages —
marketing home, analytics dashboard, hotspot map, risk predictor, and a
full developer API reference — all consuming the same backend, none of it
mocked.

## Stack

- **React 19** (plain JSX, no TypeScript) + **Vite** (rolldown-powered build)
- **Tailwind CSS v4** via `@tailwindcss/vite` — no `tailwind.config.js`;
  theme tokens (colors, shadows, fonts) live as CSS custom properties in
  `src/index.css`'s `@theme` block, and Tailwind generates utilities from them
- **lucide-react** for every icon
- **react-router-dom** for client-side routing
- **recharts** for the dashboard charts
- **react-leaflet** + **leaflet** for the hotspot map (OpenStreetMap tiles,
  no API key needed)

## Setup

```bash
npm install
cp .env.example .env   # point VITE_API_BASE_URL at your running backend
npm run dev             # http://localhost:5173
```

The backend must be running and reachable at `VITE_API_BASE_URL`, and its
CORS config (`backend/app/core/config.py`'s `cors_origins`) must include
this dev server's origin — `http://localhost:5173` is allowed by default.

## Structure

```
src/
  api/
    client.js        # fetch wrapper: base URL, query-string building, error shape
    endpoints.js      # one function per backend endpoint, grouped by resource
  hooks/
    useApi.js          # tiny data-fetching hook: {data, error, loading}, re-runs on deps
  components/
    layout/             # Navbar (floating island), Footer — used by every page
    home/                # Hero, About, Features, StatsPreview, CTASection
    dashboard/            # ChartCard + one component per chart
    hotspots/              # Map, ranked list, detail panel
    predict/                # Form (reads /reference/codes for dropdowns) + result gauge
    docs/                    # CodeBlock (copy button), EndpointCard, sidebar nav
    common/                   # Loading / ErrorState — shared across every data-fetching component
  pages/
    HomePage.jsx, DashboardPage.jsx, HotspotsPage.jsx, PredictPage.jsx, DocsPage.jsx
  utils/
    chartColors.js, riskColor.js   # shared color/severity → color mappings
  App.jsx        # route table
  main.jsx        # React root + BrowserRouter
  index.css        # Tailwind import + design tokens (@theme) + a few global classes
```

See `ARCHITECTURE.md` for how data flows through these layers and the
design-system decisions (colors, the "glossy card" style, the floating navbar).

## Talking to the backend

Every API call goes through `src/api/endpoints.js`, which wraps
`src/api/client.js`. Nothing calls `fetch()` directly from a component —
if the backend adds a query param or changes a path, it changes in exactly
one place. `src/hooks/useApi.js` is the only way components read that data;
it re-fetches whenever its dependency array changes (e.g. switching the
dimension dropdown on the dashboard) and exposes `{data, error, loading}`
for the component to render a `Loading` / `ErrorState` / real-content branch.

## Build

```bash
npm run build     # outputs to dist/
npm run preview   # serve the production build locally
```
