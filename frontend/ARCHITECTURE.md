# Frontend architecture

## Routing and page composition

`App.jsx` renders `Navbar` and `Footer` once, outside `<Routes>`, so they
persist across navigation; each route swaps only the `<main>` content:

```
/          → HomePage      (Hero, StatsPreview, About, Features, CTASection)
/dashboard → DashboardPage (HourlyChart, SeverityChart, YearlyTrendChart, DimensionExplorer)
/hotspots  → HotspotsPage  (HotspotMap, HotspotDetailPanel, HotspotList)
/predict   → PredictPage   (RiskForm, RiskResult)
/docs      → DocsPage      (DocsSidebar + one EndpointCard per API route)
```

Every page-level component composes smaller ones from `src/components/`;
no page has inline business logic — it wires a layout together and passes
callbacks (e.g. `HotspotsPage` owns `selectedId` state and passes it to
both the map and the list so clicking either one updates the other).

## Data flow, end to end

```
component mounts
      │
      ▼
useApi(() => someApi.method(params), [deps])   // src/hooks/useApi.js
      │
      ▼
src/api/endpoints.js   — e.g. analyticsApi.byDimension("weather")
      │
      ▼
src/api/client.js      — builds the URL (base + query string), fetches,
      │                   throws ApiError on non-2xx, parses JSON
      ▼
FastAPI backend
      │
      ▼
component re-renders with {data, error, loading} from useApi
      │
      ├─ loading  → <Loading /> (src/components/common/StatusState.jsx)
      ├─ error    → <ErrorState error={error} />
      └─ data     → the real chart / map / list
```

`useApi` re-runs its fetcher whenever the dependency array changes — this
is how `DimensionExplorer`'s dropdown or `HotspotDetailPanel`'s selected ID
trigger a new fetch without any manual `useEffect` in the component itself.

There is exactly one exception to "components never call fetch directly":
`RiskForm` calls `predictApi.risk(form)` inside its own submit handler
rather than through `useApi`, because a form submission is a one-shot
action with its own loading/error state (`submitting`, `submitError`), not
a re-fetch-on-dependency-change read.

## Design system

Defined once in `src/index.css`'s `@theme` block — Tailwind v4 turns each
custom property into a utility automatically (`--color-brand-500` →
`bg-brand-500` / `text-brand-500` / etc., `--shadow-glossy` → `shadow-glossy`).

- **Palette**: `brand` (indigo-blue, primary actions/links), `mint`
  (secondary accent, "good/low-risk" signal), `coral` (danger/high-risk
  signal), `ink` (grayscale text/borders scale from 50 to 900). Chosen to
  read as soft/pastel rather than saturated — see `--color-*` values.
- **`.glossy-card`**: the card style used everywhere (white-to-off-white
  gradient + soft shadow + hairline border) — one class, reused instead of
  repeating the gradient/shadow/border trio per component.
- **`.glass-panel`**: frosted-glass effect (blur + translucent white),
  used only by the floating navbar and its mobile dropdown.
- **Risk color mapping** (`src/utils/riskColor.js`) and **severity color
  mapping** (`src/utils/chartColors.js`) are the single source of truth for
  "what color means Fatal/High-risk" — both the Recharts charts and the
  Leaflet map read from these instead of hardcoding hex values twice.

## The floating "island" navbar

`Navbar.jsx` is `position: fixed`, centered, with its own rounded
`glass-panel` background — it does not span the viewport width. This is a
deliberate visual choice (an "island" rather than a full-width bar), which
is why every page's top padding starts at `pt-32`/`pt-40`: content needs to
clear the floating navbar rather than sit directly under a docked one.

## Hotspot map specifics

`HotspotMap.jsx` uses Leaflet `CircleMarker`, not the default pin `Marker`
— this sidesteps Leaflet's well-known default-icon-path issue under
bundlers (the default marker PNGs don't resolve correctly through Vite)
and doubles as the visual encoding: circle radius scales with
`accident_count`, circle color comes from `riskColor(risk_level)`. Clicking
a circle or a list row sets the same `selectedId` state in `HotspotsPage`,
which is what makes the detail panel, the highlighted marker, and the
highlighted list row all stay in sync.

## Docs page

`DocsPage.jsx` is hand-written, not generated from the OpenAPI schema the
backend already exposes at `/docs` (FastAPI's Swagger UI) — this page is
the narrative, curated version aimed at a developer integrating the API,
with copy-paste `curl` examples and a plain-English note on the one
non-obvious API behavior (`/predict/risk`'s `top_factors` are global
feature importances, not a per-request SHAP explanation). If an endpoint's
shape changes, update `EndpointCard` props here to match — there's no
build step keeping the two in sync automatically.
