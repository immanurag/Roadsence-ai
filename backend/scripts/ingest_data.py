"""
Stage 1 ETL: raw AccidentsBig.csv -> cleaned, feature-engineered `accidents`
table inside a DuckDB file that the API reads from.

Run from the backend/ directory:
    py scripts/ingest_data.py
"""

import json
import sys
from pathlib import Path

import duckdb

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core.config import PROJECT_ROOT, settings  # noqa: E402

RAW_CSV = PROJECT_ROOT / "data" / "raw" / "AccidentsBig.csv"
REPORT_PATH = PROJECT_ROOT / "data" / "processed" / "data_quality_report.json"


def main() -> None:
    if not RAW_CSV.exists():
        raise SystemExit(f"Raw CSV not found at {RAW_CSV}")

    Path(settings.duckdb_path).parent.mkdir(parents=True, exist_ok=True)
    con = duckdb.connect(settings.duckdb_path)

    con.execute("DROP TABLE IF EXISTS accidents_raw")
    con.execute(
        f"""
        CREATE TABLE accidents_raw AS
        SELECT * FROM read_csv_auto('{RAW_CSV.as_posix()}', header=True, sample_size=200000)
        """
    )

    raw_count = con.execute("SELECT COUNT(*) FROM accidents_raw").fetchone()[0]

    quality_report = {"raw_row_count": raw_count, "columns": {}}
    columns = [row[0] for row in con.execute("DESCRIBE accidents_raw").fetchall()]
    for col in columns:
        missing = con.execute(
            f'SELECT COUNT(*) FROM accidents_raw WHERE "{col}" IS NULL'
        ).fetchone()[0]
        quality_report["columns"][col] = {
            "missing_count": missing,
            "missing_pct": round(100 * missing / raw_count, 3) if raw_count else 0,
        }

    dup_count = con.execute(
        """
        SELECT COUNT(*) FROM (
            SELECT "Accident_Index", COUNT(*) c
            FROM accidents_raw GROUP BY "Accident_Index" HAVING c > 1
        )
        """
    ).fetchone()[0]
    quality_report["duplicate_accident_index_groups"] = dup_count

    con.execute("DROP TABLE IF EXISTS accidents")
    con.execute(
        """
        CREATE TABLE accidents AS
        SELECT
            "Accident_Index"                                   AS accident_index,
            longitude,
            latitude,
            "Police_Force"                                     AS police_force,
            "Accident_Severity"                                AS severity_code,
            "Number_of_Vehicles"                                AS number_of_vehicles,
            "Number_of_Casualties"                              AS number_of_casualties,
            "Day_of_Week"                                       AS day_of_week_code,
            CAST("Time" AS VARCHAR)                             AS time_raw,
            EXTRACT(hour FROM "Time")                           AS hour,
            "Local_Authority_(District)"                        AS local_authority_district,
            "Local_Authority_(Highway)"                         AS local_authority_highway,
            "1st_Road_Class"                                    AS road_class_1,
            "Road_Type"                                         AS road_type_code,
            "Speed_limit"                                       AS speed_limit,
            "Junction_Detail"                                   AS junction_detail_code,
            "Junction_Control"                                  AS junction_control_code,
            "Light_Conditions"                                  AS light_conditions_code,
            "Weather_Conditions"                                AS weather_conditions_code,
            "Road_Surface_Conditions"                           AS road_surface_conditions_code,
            "Special_Conditions_at_Site"                        AS special_conditions_code,
            "Carriageway_Hazards"                               AS carriageway_hazards_code,
            "Urban_or_Rural_Area"                                AS urban_or_rural_area_code,
            "Did_Police_Officer_Attend_Scene_of_Accident"       AS police_attended_code,
            "LSOA_of_Accident_Location"                          AS lsoa,
            "Date"::DATE                                         AS accident_date
        FROM accidents_raw
        WHERE "Accident_Index" IS NOT NULL
          AND "Accident_Severity" IN (1, 2, 3)
          AND latitude IS NOT NULL AND longitude IS NOT NULL
          AND latitude BETWEEN -90 AND 90
          AND longitude BETWEEN -180 AND 180
        QUALIFY ROW_NUMBER() OVER (PARTITION BY "Accident_Index" ORDER BY "Accident_Index") = 1
        """
    )

    con.execute(
        """
        ALTER TABLE accidents ADD COLUMN is_weekend BOOLEAN;
        UPDATE accidents SET is_weekend = day_of_week_code IN (1, 7);

        ALTER TABLE accidents ADD COLUMN time_of_day VARCHAR;
        UPDATE accidents SET time_of_day = CASE
            WHEN hour BETWEEN 0 AND 5 THEN 'Night'
            WHEN hour BETWEEN 6 AND 11 THEN 'Morning'
            WHEN hour BETWEEN 12 AND 16 THEN 'Afternoon'
            WHEN hour BETWEEN 17 AND 20 THEN 'Evening'
            ELSE 'Night'
        END;

        ALTER TABLE accidents ADD COLUMN is_peak_hour BOOLEAN;
        UPDATE accidents SET is_peak_hour = hour BETWEEN 8 AND 10 OR hour BETWEEN 17 AND 20;

        ALTER TABLE accidents ADD COLUMN year INTEGER;
        UPDATE accidents SET year = EXTRACT(year FROM accident_date);

        ALTER TABLE accidents ADD COLUMN month INTEGER;
        UPDATE accidents SET month = EXTRACT(month FROM accident_date);
        """
    )

    clean_count = con.execute("SELECT COUNT(*) FROM accidents").fetchone()[0]
    quality_report["clean_row_count"] = clean_count
    quality_report["rows_dropped"] = raw_count - clean_count

    con.execute("DROP TABLE accidents_raw")
    con.close()

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(quality_report, indent=2))

    print(f"Ingested {clean_count} clean rows (dropped {raw_count - clean_count}).")
    print(f"DuckDB file: {settings.duckdb_path}")
    print(f"Data quality report: {REPORT_PATH}")


if __name__ == "__main__":
    main()
