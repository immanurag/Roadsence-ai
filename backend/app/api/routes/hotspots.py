from fastapi import APIRouter, HTTPException, Query

from app.services import hotspot_service

router = APIRouter(prefix="/hotspots", tags=["hotspots"])


@router.get("")
def list_hotspots(
    min_accidents: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=1000),
):
    return hotspot_service.list_hotspots(min_accidents, limit)


@router.get("/{hotspot_id}")
def get_hotspot(hotspot_id: int):
    result = hotspot_service.get_hotspot_detail(hotspot_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Hotspot not found")
    return result
