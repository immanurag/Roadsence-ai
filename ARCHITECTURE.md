# System architecture

## The whole system, end to end

```
data/raw/AccidentsBig.csv
        │
        ▼   backend/scripts/ (run offline, on demand — not on every API start)
        │   ingest_data.py → train_severity_model.py → detect_hotspots.py
        ▼
data/processed/urban_risk.duckdb   (accidents, hotspots, hotspot_members tables)
        │
        ▼
backend/app/  (FastAPI, port 8010 in local dev)
        │   routes → services → duckdb cursor / joblib model
        │
        ▼   JSON over HTTP, CORS-enabled for the frontend's origin
        │
frontend/src/  (React + Vite, port 5173 in local dev)
        │   api/ → hooks/useApi → components → pages
        ▼
Browser
```

Nothing in the frontend is mocked or hardcoded — every chart, map marker,
and dropdown option is fetched from the backend at render time. The only
thing that isn't "live" in the strictest sense is the trained model file
(`backend/ml/severity_model.joblib`): it's trained offline by a script, not
retrained per request, which is the correct design for a model that should
change deliberately, not accidentally.

## Why two separate READMEs and ARCHITECTUREs instead of one

`backend/` and `frontend/` are independently runnable, independently
deployable projects that happen to live in one repo — the backend has no
knowledge of React and the frontend has no knowledge of DuckDB or
scikit-learn. Each side's README covers "how do I run just this," and each
side's ARCHITECTURE covers "how is just this laid out internally." This
root-level pair covers the one thing neither side can explain alone: how
they're wired together, and why the ports/CORS/env vars are what they are.

## The port 8000 → 8010 decision

The backend defaults to no particular port (it's a `uvicorn` CLI flag, not
a setting), but every doc in this repo uses **8010** because, on the
machine this was built on, port 8000 was already bound by an unrelated
background service listening on all interfaces (`::`). On Windows, a
dual-stack `::` listener can intercept connections to `127.0.0.1` on the
same port, which produced intermittent, hard-to-diagnose responses from
the wrong service. If your machine has 8000 free, it'll work fine — just
keep `backend`'s run command and `frontend/.env`'s `VITE_API_BASE_URL` in
sync with whatever port you actually pick.

## CORS

The backend's `Settings.cors_origins` (in `backend/app/core/config.py`)
defaults to `http://localhost:5173,http://localhost:3000` — the two most
common Vite/CRA dev ports. If you deploy the frontend somewhere else
(a real domain, a different port), add that origin to `CORS_ORIGINS` in
`backend/.env`, or the browser will block every request with a CORS error
that looks like a network failure but is actually the backend correctly
refusing an unrecognized origin.

## Extending the system

Adding a new piece of analysis (say, a new chart or a new filter) touches,
in order:

1. `backend/app/services/` — the query/computation, if it's new
2. `backend/app/schemas/` — the response shape, if it's new
3. `backend/app/api/routes/` — the endpoint, if it's new
4. `frontend/src/api/endpoints.js` — the client function
5. `frontend/src/components/` — the UI that calls it via `useApi`
6. `frontend/src/pages/DocsPage.jsx` — document it for other developers

Each layer is deliberately thin so this chain stays short — no layer does
more than one job, so there's no ambiguity about where a change belongs.
