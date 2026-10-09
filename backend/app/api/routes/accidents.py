from fastapi import APIRouter, HTTPException, Query

from app.schemas.accident import AccidentOut, PaginatedAccidents
from app.services import accidents_service

router = APIRouter(prefix="/accidents", tags=["accidents"])


@router.get("", response_model=PaginatedAccidents)
def list_accidents(
    severity_code: int | None = Query(None, ge=1, le=3),
    year: int | None = None,
    urban_or_rural_area_code: int | None = None,
    weather_conditions_code: int | None = None,
    road_surface_conditions_code: int | None = None,
    is_weekend: bool | None = None,
    time_of_day: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=500),
):
    filters = {
        "severity_code": severity_code,
        "year": year,
        "urban_or_rural_area_code": urban_or_rural_area_code,
        "weather_conditions_code": weather_conditions_code,
        "road_surface_conditions_code": road_surface_conditions_code,
        "is_weekend": is_weekend,
        "time_of_day": time_of_day,
    }
    return accidents_service.list_accidents(filters, page, page_size)


@router.get("/{accident_index}", response_model=AccidentOut)
def get_accident(accident_index: str):
    result = accidents_service.get_accident(accident_index)
    if result is None:
        raise HTTPException(status_code=404, detail="Accident not found")
    return result
