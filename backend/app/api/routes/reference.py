from fastapi import APIRouter

from app.services import reference_data as ref

router = APIRouter(prefix="/reference", tags=["reference"])


@router.get("/codes")
def all_code_mappings():
    return {
        "accident_severity": ref.ACCIDENT_SEVERITY,
        "day_of_week": ref.DAY_OF_WEEK,
        "road_type": ref.ROAD_TYPE,
        "light_conditions": ref.LIGHT_CONDITIONS,
        "weather_conditions": ref.WEATHER_CONDITIONS,
        "road_surface_conditions": ref.ROAD_SURFACE_CONDITIONS,
        "urban_or_rural_area": ref.URBAN_OR_RURAL_AREA,
        "junction_detail": ref.JUNCTION_DETAIL,
        "junction_control": ref.JUNCTION_CONTROL,
        "did_police_officer_attend": ref.DID_POLICE_OFFICER_ATTEND,
    }
