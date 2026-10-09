from fastapi import APIRouter, HTTPException

from app.schemas.predict import AIInsightRequest, AIInsightResponse, RiskPredictionRequest, RiskPredictionResponse
from app.services import ai_insight_service, prediction_service

router = APIRouter(prefix="/predict", tags=["predict"])


@router.post("/risk", response_model=RiskPredictionResponse)
def predict_risk(payload: RiskPredictionRequest):
    try:
        return prediction_service.predict_risk(payload.model_dump())
    except FileNotFoundError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc


@router.post("/insight", response_model=AIInsightResponse)
def predict_insight(payload: AIInsightRequest):
    try:
        return ai_insight_service.generate_insight(
            payload.conditions.model_dump(), payload.prediction.model_dump()
        )
    except ai_insight_service.AIInsightError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
