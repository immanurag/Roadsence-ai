from pydantic import BaseModel


class HotspotOut(BaseModel):
    hotspot_id: int
    center_latitude: float
    center_longitude: float
    accident_count: int
    fatal_count: int
    serious_count: int
    slight_count: int
    risk_score: float
    risk_level: str


class HotspotDetail(HotspotOut):
    top_weather: list[dict]
    top_road_surface: list[dict]
    peak_hour_range: str
