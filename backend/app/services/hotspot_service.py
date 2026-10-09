from app.db.duckdb_conn import get_connection
from app.services import reference_data as ref
from app.services.risk_service import risk_level


def _table_exists(con, name: str) -> bool:
    return con.execute(
        "SELECT COUNT(*) FROM information_schema.tables WHERE table_name = ?", [name]
    ).fetchone()[0] > 0


def list_hotspots(min_accidents: int = 1, limit: int = 100) -> list[dict]:
    con = get_connection()
    if not _table_exists(con, "hotspots"):
        return []
    rows = con.execute(
        """
        SELECT hotspot_id, center_latitude, center_longitude, accident_count,
               fatal_count, serious_count, slight_count, risk_score
        FROM hotspots
        WHERE accident_count >= ?
        ORDER BY risk_score DESC
        LIMIT ?
        """,
        [min_accidents, limit],
    ).fetchall()
    columns = [
        "hotspot_id", "center_latitude", "center_longitude", "accident_count",
        "fatal_count", "serious_count", "slight_count", "risk_score",
    ]
    results = []
    for row in rows:
        record = dict(zip(columns, row))
        record["risk_level"] = risk_level(record["risk_score"])
        results.append(record)
    return results


def get_hotspot_detail(hotspot_id: int) -> dict | None:
    con = get_connection()
    if not _table_exists(con, "hotspots"):
        return None

    header = con.execute(
        """
        SELECT hotspot_id, center_latitude, center_longitude, accident_count,
               fatal_count, serious_count, slight_count, risk_score
        FROM hotspots WHERE hotspot_id = ?
        """,
        [hotspot_id],
    ).fetchone()
    if header is None:
        return None

    columns = [
        "hotspot_id", "center_latitude", "center_longitude", "accident_count",
        "fatal_count", "serious_count", "slight_count", "risk_score",
    ]
    record = dict(zip(columns, header))
    record["risk_level"] = risk_level(record["risk_score"])

    weather_rows = con.execute(
        """
        SELECT a.weather_conditions_code, COUNT(*) c
        FROM accidents a JOIN hotspot_members m ON a.accident_index = m.accident_index
        WHERE m.hotspot_id = ?
        GROUP BY 1 ORDER BY c DESC LIMIT 3
        """,
        [hotspot_id],
    ).fetchall()
    record["top_weather"] = [
        {"label": ref.label(ref.WEATHER_CONDITIONS, code), "count": c} for code, c in weather_rows
    ]

    surface_rows = con.execute(
        """
        SELECT a.road_surface_conditions_code, COUNT(*) c
        FROM accidents a JOIN hotspot_members m ON a.accident_index = m.accident_index
        WHERE m.hotspot_id = ?
        GROUP BY 1 ORDER BY c DESC LIMIT 3
        """,
        [hotspot_id],
    ).fetchall()
    record["top_road_surface"] = [
        {"label": ref.label(ref.ROAD_SURFACE_CONDITIONS, code), "count": c} for code, c in surface_rows
    ]

    peak_hour = con.execute(
        """
        SELECT a.hour, COUNT(*) c
        FROM accidents a JOIN hotspot_members m ON a.accident_index = m.accident_index
        WHERE m.hotspot_id = ?
        GROUP BY 1 ORDER BY c DESC LIMIT 1
        """,
        [hotspot_id],
    ).fetchone()
    record["peak_hour_range"] = f"{peak_hour[0]:02d}:00-{(peak_hour[0] + 1) % 24:02d}:00" if peak_hour else "N/A"

    return record
