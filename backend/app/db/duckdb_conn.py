import threading

import duckdb

from app.core.config import settings

_base_connection: duckdb.DuckDBPyConnection | None = None
_lock = threading.Lock()


def _get_base_connection() -> duckdb.DuckDBPyConnection:
    global _base_connection
    if _base_connection is None:
        with _lock:
            if _base_connection is None:
                _base_connection = duckdb.connect(settings.duckdb_path, read_only=True)
    return _base_connection


def get_connection() -> duckdb.DuckDBPyConnection:
    """Returns a fresh cursor off the shared base connection.

    FastAPI runs sync route handlers in a thread pool, and a single DuckDB
    connection isn't safe to query from multiple threads at once — it was
    intermittently returning corrupted/empty results under concurrent
    requests. `.cursor()` shares the same database but is independently
    usable per call, which is DuckDB's documented pattern for this.
    """
    return _get_base_connection().cursor()
