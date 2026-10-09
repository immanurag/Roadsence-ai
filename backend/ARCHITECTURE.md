# Backend architecture

## Layering

```
HTTP request
    │
    ▼
app/api/routes/*.py     — one router per resource. Parses query/body params,
    │                      calls a service, maps errors to HTTP status codes.
    │                      No SQL, no business logic here.
    ▼
app/services/*.py       — the actual logic. Builds SQL, applies filters,
    │                      shapes rows into response dicts, computes risk
    │                      scores, runs model inference.
    ▼
app/db/duckdb_conn.py   — one function, get_connection(), returns a fresh
    │                      DuckDB cursor for this call.
    ▼
data/processed/urban_risk.duckdb   — the actual data, built offline by
                                      scripts/, never written to by the API.
```

`app/schemas/*.py` sits alongside this as Pydantic models — FastAPI uses
them to validate requests and serialize responses; services return plain
dicts that happen to match the schema shape (no schema imports inside
services, to keep them testable without FastAPI).

`app/services/reference_data.py` is the one file every layer touches: it's
the STATS19 code→label lookup table, used by `accidents_service` and
`analytics_service` to turn integer codes into readable strings, and
exposed directly via `/reference/codes` for the frontend to build dropdowns
from instead of hardcoding the same mapping twice.

## Why a request goes through a *service*, not straight from route to SQL

Every route function is a thin adapter: FastAPI-specific concerns (query
param parsing, HTTP status codes, response models) live there and nowhere
else. Everything that would need testing without spinning up an HTTP
server — filter building, risk scoring, label mapping — lives in
`services/`, which only imports `db` and `schemas`-shaped dicts, never
`fastapi`.

## Data pipeline (offline, not part of the request path)

```
data/raw/AccidentsBig.csv
        │
        ▼  scripts/ingest_data.py
        │  - reads via DuckDB's read_csv_auto (no pandas needed for this step)
        │  - drops the ~988k blank padding rows (see README's "Data note")
        │  - drops duplicate Accident_Index, invalid severity/coordinates
        │  - engineers hour, time_of_day, is_weekend, is_peak_hour, year, month
        │  - writes data_quality_report.json (missingness, dup counts)
        ▼
accidents table (DuckDB)
        │
        ├─▶  scripts/train_severity_model.py
        │        - pulls pre-crash-only feature columns (no vehicle/casualty
        │          counts — those are outcomes, including them would leak)
        │        - trains Logistic Regression + Random Forest, keeps the
        │          higher macro-F1 model
        │        - persists ml/severity_model.joblib + ml/metrics.json
        │        - used at request time by prediction_service.py
        │
        └─▶  scripts/detect_hotspots.py
                 - DBSCAN over haversine distance (scikit-learn), eps/min_samples
                   from Settings (HOTSPOT_EPS_KM / HOTSPOT_MIN_SAMPLES)
                 - writes `hotspots` (one row per cluster, risk-scored) and
                   `hotspot_members` (accident_index → hotspot_id) tables
                 - used at request time by hotspot_service.py
```

Re-run `ingest_data.py` whenever the raw CSV changes; re-run the other two
scripts after that so the model and hotspot tables reflect the new data —
nothing does this automatically, by design, since retraining is a
deliberate, reviewable step, not a side effect of an API request.

## Why DuckDB, one connection, one cursor per request

DuckDB embeds the whole database as a single file with no server process —
appropriate for a dataset this size (tens of thousands of rows) that's
read-heavy and rebuilt offline rather than written to live. `app/db/duckdb_conn.py`
keeps one base connection open in read-only mode and hands out a fresh
`.cursor()` per call to `get_connection()`. This matters because FastAPI
runs synchronous route handlers in a thread pool: a single DuckDB
connection queried concurrently from multiple threads produced intermittent
corrupted results (`fetchone()` returning `None` on a query that can never
legitimately return zero rows) once more than one request hit the API at
once. Cursors from the same base connection are DuckDB's documented
mechanism for concurrent access; opening a brand-new `duckdb.connect()` per
request would also work but re-parses the file's metadata every time.

## Adding a new endpoint

1. Add/extend a function in the relevant `app/services/*.py` — it should
   take plain Python values in, return a plain dict (or list of dicts) out.
2. Add a Pydantic model in `app/schemas/` if the response shape is new.
3. Add a route function in `app/api/routes/` that parses params and calls
   the service. Register the router in `app/main.py` if it's a new file.
4. Document it in `README.md`'s endpoint table and, if it's developer-facing,
   in the frontend's `/docs` page (`frontend/src/pages/DocsPage.jsx`) —
   the two are maintained by hand, not generated from one source.
