# Urban Risk Intelligence — Backend

FastAPI + DuckDB backend for road-accident analytics, DBSCAN hotspot
detection, and a severity-risk prediction model. No notebooks — every
transformation is a script or an API service so the whole thing is
deployable as-is.

## Why DuckDB instead of Postgres

The dataset (~60k real records; see note below) is analytical, read-heavy,
and single-writer. DuckDB gives fast columnar aggregation with zero server
to run or deploy — the whole database is one file (`data/processed/urban_risk.duckdb`)
that ships alongside the app. Swapping to PostgreSQL/PostGIS later only
touches `app/db/` and the SQL in `app/services/`; the API surface doesn't change.

## Data note

`AccidentsBig.csv` contains only **59,998 real accident records** — every row
after that is a fully blank line (all commas, no values) padding the file to
~1,048,575 lines. `scripts/ingest_data.py` filters these out; the reported
"rows_dropped" in the data quality report is expected and correct, not a bug.

## Architecture

```
backend/
  app/
    core/config.py       # settings (env-driven)
    db/duckdb_conn.py     # single shared DuckDB connection
    schemas/              # Pydantic response/request models
    services/              # business logic, one module per concern
      reference_data.py    # STATS19 code -> label mappings
      accidents_service.py # filtered/paginated record queries
      analytics_service.py # aggregations (severity, hourly, by-dimension...)
      hotspot_service.py    # reads precomputed hotspot tables
      risk_service.py       # shared risk-score/level thresholds
      prediction_service.py # loads trained model, serves predictions
    api/routes/            # one router per resource, included in main.py
    main.py                 # FastAPI app assembly
  scripts/
    ingest_data.py          # raw CSV -> cleaned `accidents` table
    detect_hotspots.py       # DBSCAN clustering -> `hotspots` tables
    train_severity_model.py  # trains + persists the risk-severity model
  ml/                        # trained model + metrics (git-ignored)
  data/                      # not stored here; see project-root data/
```

## Setup

Requires Python 3.12 (3.14 lacks prebuilt wheels for pandas/scikit-learn at
time of writing — the install falls back to a from-source build that needs
a full MSVC toolchain).

```bash
py -3.12 -m venv .venv
./.venv/Scripts/pip install -r requirements.txt
```

## Pipeline (run once, in order)

```bash
./.venv/Scripts/python scripts/ingest_data.py        # -> data/processed/urban_risk.duckdb
./.venv/Scripts/python scripts/train_severity_model.py  # -> ml/severity_model.joblib
./.venv/Scripts/python scripts/detect_hotspots.py       # -> hotspots tables in the duckdb file
```

Re-run `ingest_data.py` any time the raw CSV changes; re-run the other two
after that to keep the model and hotspots in sync.

## Run the API

```bash
./.venv/Scripts/python -m uvicorn app.main:app --reload --port 8010
```

Interactive docs at `http://127.0.0.1:8010/docs`.

Port 8010 (not the more obvious 8000) is deliberate — on at least one dev
machine used for this project, port 8000 was already claimed by an
unrelated service bound to all interfaces, which silently intercepted a
fraction of requests. Pick any free port; just keep `frontend/.env`'s
`VITE_API_BASE_URL` pointed at whatever you choose.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | liveness check |
| GET | `/accidents` | paginated, filterable accident records |
| GET | `/accidents/{accident_index}` | single record |
| GET | `/analytics/severity` | Fatal/Serious/Slight breakdown |
| GET | `/analytics/hourly` | accidents by hour, split by severity |
| GET | `/analytics/yearly` | accidents by year |
| GET | `/analytics/day-of-week` | accidents by day of week |
| GET | `/analytics/by-dimension/{dimension}` | counts by weather/road_surface/light/road_type/urban_rural/junction_detail/time_of_day |
| GET | `/analytics/leading-causes` | most common weather+surface+light combinations among severe accidents |
| GET | `/hotspots` | precomputed DBSCAN hotspots, ranked by risk score |
| GET | `/hotspots/{hotspot_id}` | hotspot detail: top weather/surface, peak hour |
| POST | `/predict/risk` | severity-risk prediction for given pre-crash conditions |
| POST | `/predict/insight` | Gemini 2.5 Flash (via LangChain) plain-language explanation of a `/predict/risk` result — headline, per-factor reasoning, and recommendations |
| GET | `/reference/codes` | all STATS19 code -> label mappings, for building frontend dropdowns |

## Gen AI insight (`/predict/insight`)

`app/services/ai_insight_service.py` calls Gemini 2.5 Flash through
`langchain-google-genai`, using `with_structured_output` against the
`AIInsightResponse` schema so the model's reply is always valid JSON matching
`app/schemas/predict.py`, not free-form text the frontend has to parse. The
prompt hands the LLM the human-readable condition labels (from
`reference_data.py`) plus the numeric `/predict/risk` output, and asks for a
headline, a short narrative, one explanation per contributing factor, and 2-4
recommendations — nothing the model has to infer beyond what it's given.

Requires `GEMINI_API_KEY` (get one from Google AI Studio) set in `backend/.env`
— see `.env.example`. Without it, `/predict/insight` returns `503` and the
frontend shows a graceful "AI explanation unavailable" notice; `/predict/risk`
and every other endpoint work regardless, since the numeric model has no
dependency on the LLM.

## Known limitations (by design, documented rather than hidden)

- **Model quality**: macro F1 ≈ 0.35 (see `ml/metrics.json`). Fatal accidents
  are a small minority of ~60k records and pre-crash-only features (no
  vehicle/casualty counts, to avoid leakage) carry limited signal. Good
  enough to demonstrate the pipeline; not a claim of production accuracy.
- **`top_factors` in `/predict/risk`** are the model's *global* feature
  importances, not a per-prediction SHAP explanation. Swapping in real SHAP
  values is a documented next step, not yet implemented.
- **Category code mappings** in `reference_data.py` follow the standard UK
  DfT STATS19 coding manual; verify against your exact data dictionary if a
  code renders as `Unknown (<code>)`.
- Single shared DuckDB connection — fine for a read-mostly analytics API at
  this scale; a high-concurrency deployment would want per-request cursors
  or a move to Postgres.

## Deploying to Render

`render.yaml` at the repo root defines the service. Render (via its Blueprint
feature — "New +" → "Blueprint" → point at this repo) will:

1. `bash build.sh` — installs `requirements.txt`, then runs `ingest_data.py`
   → `train_severity_model.py` → `detect_hotspots.py` against the committed
   `data/raw/AccidentsBig.csv`, rebuilding the DuckDB file and model fresh
   on every deploy (no persistent disk needed — this is why the raw CSV is
   committed to the repo instead of gitignored, unlike the derived DuckDB
   file and `.joblib` model, which stay generated-only).
2. Start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT` — Render
   assigns `$PORT` dynamically, so the app must bind to it and to `0.0.0.0`,
   not a hardcoded port/host.

After the frontend is deployed, update the `CORS_ORIGINS` env var on the
Render service (Dashboard → your service → Environment) to the frontend's
real URL — the checked-in default only allows `localhost:5173`, so
requests from a deployed frontend will otherwise fail with a CORS error.

Rebuilding the model on every deploy means Render's free-tier build will
take a couple of minutes (ETL + DBSCAN + Random Forest training), not
seconds — expected, not a hang.

