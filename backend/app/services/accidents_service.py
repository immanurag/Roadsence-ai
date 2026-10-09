from app.db.duckdb_conn import get_connection
from app.services import reference_data as ref

_FILTERABLE_COLUMNS = {
    "severity_code": "severity_code",
    "year": "year",
    "urban_or_rural_area_code": "urban_or_rural_area_code",
    "weather_conditions_code": "weather_conditions_code",
    "road_surface_conditions_code": "road_surface_conditions_code",
    "is_weekend": "is_weekend",
    "time_of_day": "time_of_day",
}


def _build_where(filters: dict) -> tuple[str, list]:
    clauses, params = [], []
    for key, value in filters.items():
        if value is None or key not in _FILTERABLE_COLUMNS:
            continue
        clauses.append(f"{_FILTERABLE_COLUMNS[key]} = ?")
        params.append(value)
    if not clauses:
        return "", params
    return "WHERE " + " AND ".join(clauses), params


def _row_to_dict(columns: list[str], row: tuple) -> dict:
    record = dict(zip(columns, row))
    record["accident_index"] = str(record["accident_index"])
    record["severity_label"] = ref.label(ref.ACCIDENT_SEVERITY, record["severity_code"])
    record["day_of_week_label"] = ref.label(ref.DAY_OF_WEEK, record["day_of_week_code"])
    record["road_type_label"] = ref.label(ref.ROAD_TYPE, record["road_type_code"])
    record["light_conditions_label"] = ref.label(ref.LIGHT_CONDITIONS, record["light_conditions_code"])
    record["weather_conditions_label"] = ref.label(ref.WEATHER_CONDITIONS, record["weather_conditions_code"])
    record["road_surface_conditions_label"] = ref.label(
        ref.ROAD_SURFACE_CONDITIONS, record["road_surface_conditions_code"]
    )
    record["urban_or_rural_area_label"] = ref.label(
        ref.URBAN_OR_RURAL_AREA, record["urban_or_rural_area_code"]
    )
    return record


def list_accidents(filters: dict, page: int, page_size: int) -> dict:
    con = get_connection()
    where_sql, params = _build_where(filters)

    total = con.execute(f"SELECT COUNT(*) FROM accidents {where_sql}", params).fetchone()[0]

    columns = [
        "accident_index", "longitude", "latitude", "severity_code",
        "number_of_vehicles", "number_of_casualties", "day_of_week_code",
        "hour", "time_of_day", "is_weekend", "is_peak_hour", "road_type_code",
        "speed_limit", "light_conditions_code", "weather_conditions_code",
        "road_surface_conditions_code", "urban_or_rural_area_code", "accident_date",
    ]
    offset = (page - 1) * page_size
    rows = con.execute(
        f"""
        SELECT {", ".join(columns)}
        FROM accidents
        {where_sql}
        ORDER BY accident_date DESC
        LIMIT ? OFFSET ?
        """,
        [*params, page_size, offset],
    ).fetchall()

    items = [_row_to_dict(columns, row) for row in rows]
    return {"total": total, "page": page, "page_size": page_size, "items": items}


def get_accident(accident_index: str) -> dict | None:
    con = get_connection()
    columns = [
        "accident_index", "longitude", "latitude", "severity_code",
        "number_of_vehicles", "number_of_casualties", "day_of_week_code",
        "hour", "time_of_day", "is_weekend", "is_peak_hour", "road_type_code",
        "speed_limit", "light_conditions_code", "weather_conditions_code",
        "road_surface_conditions_code", "urban_or_rural_area_code", "accident_date",
    ]
    row = con.execute(
        f"SELECT {', '.join(columns)} FROM accidents WHERE accident_index = ?",
        [accident_index],
    ).fetchone()
    if row is None:
        return None
    return _row_to_dict(columns, row)
