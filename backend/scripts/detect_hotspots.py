"""
Stage 3 spatial analysis: DBSCAN clustering of accident coordinates into
geographic hotspots, written to `hotspots` / `hotspot_members` tables.

Run after ingest_data.py, from the backend/ directory:
    py scripts/detect_hotspots.py
"""

import sys
from pathlib import Path

import duckdb
import numpy as np
from sklearn.cluster import DBSCAN

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core.config import settings  # noqa: E402
from app.services.risk_service import compute_hotspot_risk_score  # noqa: E402

EARTH_RADIUS_KM = 6371.0088


def main() -> None:
    con = duckdb.connect(settings.duckdb_path)

    df = con.execute(
        "SELECT accident_index, latitude, longitude, severity_code FROM accidents"
    ).fetchdf()
    print(f"Clustering {len(df)} accident points...")

    coords_rad = np.radians(df[["latitude", "longitude"]].to_numpy())
    eps_rad = settings.hotspot_eps_km / EARTH_RADIUS_KM

    db = DBSCAN(
        eps=eps_rad,
        min_samples=settings.hotspot_min_samples,
        metric="haversine",
        algorithm="ball_tree",
        n_jobs=-1,
    ).fit(coords_rad)

    df["cluster"] = db.labels_
    clustered = df[df["cluster"] != -1].copy()
    n_clusters = clustered["cluster"].nunique()
    print(f"Found {n_clusters} hotspots ({len(clustered)} of {len(df)} points assigned).")

    summary_rows = []
    member_rows = []
    for cluster_id, group in clustered.groupby("cluster"):
        fatal = int((group["severity_code"] == 1).sum())
        serious = int((group["severity_code"] == 2).sum())
        slight = int((group["severity_code"] == 3).sum())
        risk_score = compute_hotspot_risk_score(fatal, serious, slight)
        summary_rows.append(
            (
                int(cluster_id),
                float(group["latitude"].mean()),
                float(group["longitude"].mean()),
                int(len(group)),
                fatal,
                serious,
                slight,
                risk_score,
            )
        )
        for accident_index in group["accident_index"]:
            member_rows.append((int(cluster_id), accident_index))

    con.execute("DROP TABLE IF EXISTS hotspots")
    con.execute(
        """
        CREATE TABLE hotspots (
            hotspot_id INTEGER PRIMARY KEY,
            center_latitude DOUBLE,
            center_longitude DOUBLE,
            accident_count INTEGER,
            fatal_count INTEGER,
            serious_count INTEGER,
            slight_count INTEGER,
            risk_score DOUBLE
        )
        """
    )
    con.executemany("INSERT INTO hotspots VALUES (?, ?, ?, ?, ?, ?, ?, ?)", summary_rows)

    con.execute("DROP TABLE IF EXISTS hotspot_members")
    con.execute(
        "CREATE TABLE hotspot_members (hotspot_id INTEGER, accident_index VARCHAR)"
    )
    con.executemany("INSERT INTO hotspot_members VALUES (?, ?)", member_rows)

    con.close()
    print("Hotspot tables written.")


if __name__ == "__main__":
    main()
