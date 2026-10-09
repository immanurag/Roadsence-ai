from pathlib import Path

import joblib
import pandas as pd

from app.core.config import settings
from app.services import reference_data as ref
from app.services.risk_service import risk_level

_bundle = None


def _load_bundle():
    global _bundle
    if _bundle is None:
        if not Path(settings.model_path).exists():
            raise FileNotFoundError(
                f"No trained model at {settings.model_path}. Run scripts/train_severity_model.py first."
            )
        _bundle = joblib.load(settings.model_path)
    return _bundle


def predict_risk(payload: dict) -> dict:
    bundle = _load_bundle()
    pipeline = bundle["pipeline"]
    numeric = bundle["numeric_features"]
    categorical = bundle["categorical_features"]

    row = {
        "hour": payload["hour"],
        "speed_limit": payload["speed_limit"],
        "day_of_week_code": payload["day_of_week_code"],
        "is_weekend": int(payload["day_of_week_code"] in (1, 7)),
        "is_peak_hour": int(payload["hour"] in range(8, 11) or payload["hour"] in range(17, 21)),
        "road_type_code": payload["road_type_code"],
        "junction_detail_code": payload["junction_detail_code"],
        "junction_control_code": payload["junction_control_code"],
        "light_conditions_code": payload["light_conditions_code"],
        "weather_conditions_code": payload["weather_conditions_code"],
        "road_surface_conditions_code": payload["road_surface_conditions_code"],
        "urban_or_rural_area_code": payload["urban_or_rural_area_code"],
        "special_conditions_code": payload.get("special_conditions_code", 0),
        "carriageway_hazards_code": payload.get("carriageway_hazards_code", 0),
    }
    X = pd.DataFrame([row])[numeric + categorical]

    proba = pipeline.predict_proba(X)[0]
    classes = pipeline.named_steps["model"].classes_
    class_proba = dict(zip(classes.tolist(), proba.tolist()))

    severe_probability = class_proba.get(1, 0.0) + class_proba.get(2, 0.0)
    predicted_class = int(classes[proba.argmax()])

    importances = bundle.get("feature_importances") or {}
    top_factors = sorted(importances.items(), key=lambda kv: kv[1], reverse=True)[:5]

    return {
        "predicted_severity_label": ref.label(ref.ACCIDENT_SEVERITY, predicted_class),
        "severe_probability": round(severe_probability, 4),
        "risk_level": risk_level(severe_probability),
        "top_factors": [{"feature": name, "contribution": round(val, 4)} for name, val in top_factors],
    }
