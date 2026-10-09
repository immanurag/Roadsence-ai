"""
Stage 2 ML: train a severity-risk classifier from pre-crash conditions only
(no outcome fields like casualty/vehicle counts, to avoid leakage).

Run after ingest_data.py, from the backend/ directory:
    py scripts/train_severity_model.py
"""

import json
import sys
from pathlib import Path

import duckdb
import joblib
import numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.core.config import BACKEND_ROOT, settings  # noqa: E402

NUMERIC_FEATURES = ["hour", "speed_limit"]
CATEGORICAL_FEATURES = [
    "day_of_week_code", "is_weekend", "is_peak_hour", "road_type_code",
    "junction_detail_code", "junction_control_code", "light_conditions_code",
    "weather_conditions_code", "road_surface_conditions_code",
    "urban_or_rural_area_code", "special_conditions_code", "carriageway_hazards_code",
]
TARGET = "severity_code"
MAX_TRAIN_ROWS = 400_000
METRICS_PATH = BACKEND_ROOT / "ml" / "metrics.json"


def load_data():
    con = duckdb.connect(settings.duckdb_path, read_only=True)
    df = con.execute(
        f"""
        SELECT {', '.join(NUMERIC_FEATURES + CATEGORICAL_FEATURES + [TARGET])}
        FROM accidents
        """
    ).fetchdf()
    con.close()
    df = df.dropna()
    for col in ("is_weekend", "is_peak_hour"):
        df[col] = df[col].astype(int)
    if len(df) > MAX_TRAIN_ROWS:
        df = df.sample(n=MAX_TRAIN_ROWS, random_state=42)
    return df


def build_pipeline(estimator):
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", "passthrough", NUMERIC_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_FEATURES),
        ]
    )
    return Pipeline([("preprocess", preprocessor), ("model", estimator)])


def main() -> None:
    df = load_data()
    X = df[NUMERIC_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    candidates = {
        "logistic_regression": build_pipeline(
            LogisticRegression(max_iter=1000, class_weight="balanced")
        ),
        "random_forest": build_pipeline(
            RandomForestClassifier(
                n_estimators=200, max_depth=18, class_weight="balanced_subsample",
                n_jobs=-1, random_state=42,
            )
        ),
    }

    metrics = {}
    best_name, best_pipeline, best_f1 = None, None, -1.0
    for name, pipeline in candidates.items():
        print(f"Training {name}...")
        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)
        report = classification_report(y_test, preds, output_dict=True, zero_division=0)
        metrics[name] = report
        macro_f1 = report["macro avg"]["f1-score"]
        print(f"  macro F1 = {macro_f1:.4f}")
        if macro_f1 > best_f1:
            best_name, best_pipeline, best_f1 = name, pipeline, macro_f1

    print(f"Best model: {best_name} (macro F1 = {best_f1:.4f})")

    feature_names = list(NUMERIC_FEATURES)
    ohe = best_pipeline.named_steps["preprocess"].named_transformers_["cat"]
    feature_names += list(ohe.get_feature_names_out(CATEGORICAL_FEATURES))

    importances = None
    model = best_pipeline.named_steps["model"]
    if hasattr(model, "feature_importances_"):
        importances = dict(zip(feature_names, model.feature_importances_.tolist()))
    elif hasattr(model, "coef_"):
        importances = dict(zip(feature_names, np.abs(model.coef_).mean(axis=0).tolist()))

    Path(settings.model_path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(
        {
            "pipeline": best_pipeline,
            "numeric_features": NUMERIC_FEATURES,
            "categorical_features": CATEGORICAL_FEATURES,
            "feature_names": feature_names,
            "feature_importances": importances,
            "model_name": best_name,
        },
        settings.model_path,
    )

    METRICS_PATH.parent.mkdir(parents=True, exist_ok=True)
    METRICS_PATH.write_text(json.dumps({"comparison": metrics, "selected_model": best_name}, indent=2))

    print(f"Saved model to {settings.model_path}")
    print(f"Saved metrics to {METRICS_PATH}")


if __name__ == "__main__":
    main()
