"""Shared risk-scoring thresholds.

These bands are this project's own methodology for turning a normalized
[0, 1] score into a label — they are not an official government
classification.
"""


def risk_level(score: float) -> str:
    if score < 0.25:
        return "Low"
    if score < 0.50:
        return "Moderate"
    if score < 0.75:
        return "High"
    return "Critical"


def compute_hotspot_risk_score(fatal_count: int, serious_count: int, slight_count: int) -> float:
    total = fatal_count + serious_count + slight_count
    if total == 0:
        return 0.0
    severity_component = (fatal_count * 3 + serious_count * 2 + slight_count * 1) / (total * 3)
    volume_component = min(total / 200, 1.0)
    return round(0.6 * severity_component + 0.4 * volume_component, 4)
