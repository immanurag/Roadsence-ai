from app.db.duckdb_conn import get_connection
from app.services import reference_data as ref


def severity_breakdown() -> dict:
    con = get_connection()
    rows = con.execute(
        "SELECT severity_code, COUNT(*) FROM accidents GROUP BY severity_code ORDER BY severity_code"
    ).fetchall()
    breakdown = [{"label": ref.label(ref.ACCIDENT_SEVERITY, code), "count": count} for code, count in rows]
    return {"breakdown": breakdown, "total": sum(c for _, c in rows)}


def hourly_distribution() -> list[dict]:
    con = get_connection()
    rows = con.execute(
        """
        SELECT
            hour,
            COUNT(*) AS total,
            SUM(CASE WHEN severity_code = 1 THEN 1 ELSE 0 END) AS fatal,
            SUM(CASE WHEN severity_code = 2 THEN 1 ELSE 0 END) AS serious,
            SUM(CASE WHEN severity_code = 3 THEN 1 ELSE 0 END) AS slight
        FROM accidents
        WHERE hour IS NOT NULL
        GROUP BY hour
        ORDER BY hour
        """
    ).fetchall()
    return [
        {"hour": h, "count": total, "fatal_count": fatal, "serious_count": serious, "slight_count": slight}
        for h, total, fatal, serious, slight in rows
    ]


def yearly_trend() -> list[dict]:
    con = get_connection()
    rows = con.execute(
        "SELECT year, COUNT(*) FROM accidents WHERE year IS NOT NULL GROUP BY year ORDER BY year"
    ).fetchall()
    return [{"year": y, "count": c} for y, c in rows]


_MONTH_NAMES = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec",
}


def monthly_trend() -> list[dict]:
    con = get_connection()
    rows = con.execute(
        """
        SELECT
            month,
            COUNT(*) AS total,
            SUM(CASE WHEN severity_code = 1 THEN 1 ELSE 0 END) AS fatal,
            SUM(CASE WHEN severity_code = 2 THEN 1 ELSE 0 END) AS serious,
            SUM(CASE WHEN severity_code = 3 THEN 1 ELSE 0 END) AS slight
        FROM accidents
        WHERE month IS NOT NULL
        GROUP BY month
        ORDER BY month
        """
    ).fetchall()
    return [
        {
            "month": m,
            "month_label": _MONTH_NAMES.get(m, str(m)),
            "count": total,
            "fatal_count": fatal,
            "serious_count": serious,
            "slight_count": slight,
        }
        for m, total, fatal, serious, slight in rows
    ]


def day_of_week_distribution() -> list[dict]:
    con = get_connection()
    rows = con.execute(
        "SELECT day_of_week_code, COUNT(*) FROM accidents GROUP BY day_of_week_code ORDER BY day_of_week_code"
    ).fetchall()
    return [{"label": ref.label(ref.DAY_OF_WEEK, code), "count": count} for code, count in rows]


_DIMENSION_MAP = {
    "weather": ("weather_conditions_code", ref.WEATHER_CONDITIONS),
    "road_surface": ("road_surface_conditions_code", ref.ROAD_SURFACE_CONDITIONS),
    "light": ("light_conditions_code", ref.LIGHT_CONDITIONS),
    "road_type": ("road_type_code", ref.ROAD_TYPE),
    "urban_rural": ("urban_or_rural_area_code", ref.URBAN_OR_RURAL_AREA),
    "junction_detail": ("junction_detail_code", ref.JUNCTION_DETAIL),
    "time_of_day": ("time_of_day", None),
}


def counts_by_dimension(dimension: str, severity_code: int | None = None) -> list[dict]:
    if dimension not in _DIMENSION_MAP:
        raise ValueError(f"Unknown dimension '{dimension}'. Valid options: {list(_DIMENSION_MAP)}")
    column, mapping = _DIMENSION_MAP[dimension]

    con = get_connection()
    where_sql, params = "", []
    if severity_code is not None:
        where_sql = "WHERE severity_code = ?"
        params.append(severity_code)

    rows = con.execute(
        f"SELECT {column}, COUNT(*) FROM accidents {where_sql} GROUP BY {column} ORDER BY COUNT(*) DESC",
        params,
    ).fetchall()

    return [
        {"label": ref.label(mapping, code) if mapping else str(code), "count": count}
        for code, count in rows
    ]


def leading_causes(top_n: int = 10) -> list[dict]:
    """Approximate 'contributing cause' ranking by combining hazard-style
    factor columns (there is no single 'cause' field in STATS19-derived data).
    """
    con = get_connection()
    rows = con.execute(
        """
        SELECT weather_conditions_code, road_surface_conditions_code, light_conditions_code, COUNT(*) AS c
        FROM accidents
        WHERE severity_code IN (1, 2)
        GROUP BY 1, 2, 3
        ORDER BY c DESC
        LIMIT ?
        """,
        [top_n],
    ).fetchall()
    return [
        {
            "weather": ref.label(ref.WEATHER_CONDITIONS, w),
            "road_surface": ref.label(ref.ROAD_SURFACE_CONDITIONS, r),
            "light": ref.label(ref.LIGHT_CONDITIONS, light),
            "severe_accident_count": c,
        }
        for w, r, light, c in rows
    ]
