from fastapi import APIRouter, HTTPException, Query

from app.services import analytics_service

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/severity")
def severity_breakdown():
    return analytics_service.severity_breakdown()


@router.get("/hourly")
def hourly_distribution():
    return analytics_service.hourly_distribution()


@router.get("/yearly")
def yearly_trend():
    return analytics_service.yearly_trend()


@router.get("/monthly")
def monthly_trend():
    return analytics_service.monthly_trend()


@router.get("/day-of-week")
def day_of_week_distribution():
    return analytics_service.day_of_week_distribution()


@router.get("/by-dimension/{dimension}")
def counts_by_dimension(dimension: str, severity_code: int | None = Query(None, ge=1, le=3)):
    try:
        return analytics_service.counts_by_dimension(dimension, severity_code)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/leading-causes")
def leading_causes(top_n: int = Query(10, ge=1, le=50)):
    return analytics_service.leading_causes(top_n)
