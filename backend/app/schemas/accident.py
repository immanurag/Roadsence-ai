from datetime import date

from pydantic import BaseModel


class AccidentOut(BaseModel):
    accident_index: str
    longitude: float
    latitude: float
    severity_code: int
    severity_label: str
    number_of_vehicles: int
    number_of_casualties: int
    day_of_week_label: str
    hour: int | None
    time_of_day: str | None
    is_weekend: bool | None
    is_peak_hour: bool | None
    road_type_label: str
    speed_limit: int | None
    light_conditions_label: str
    weather_conditions_label: str
    road_surface_conditions_label: str
    urban_or_rural_area_label: str
    accident_date: date


class PaginatedAccidents(BaseModel):
    total: int
    page: int
    page_size: int
    items: list[AccidentOut]
