from pydantic import BaseModel, Field


class RiskPredictionRequest(BaseModel):
    hour: int = Field(ge=0, le=23)
    day_of_week_code: int = Field(ge=1, le=7, description="1=Sunday ... 7=Saturday")
    road_type_code: int
    speed_limit: int
    junction_detail_code: int
    junction_control_code: int
    light_conditions_code: int
    weather_conditions_code: int
    road_surface_conditions_code: int
    urban_or_rural_area_code: int
    special_conditions_code: int = 0
    carriageway_hazards_code: int = 0


class ContributingFactor(BaseModel):
    feature: str
    contribution: float


class RiskPredictionResponse(BaseModel):
    predicted_severity_label: str
    severe_probability: float
    risk_level: str
    top_factors: list[ContributingFactor]


class AIInsightRequest(BaseModel):
    conditions: RiskPredictionRequest
    prediction: RiskPredictionResponse


class InsightPoint(BaseModel):
    factor: str = Field(description="The feature key this point explains, copied verbatim from top_factors")
    label: str = Field(description="Short human-readable title for this point, 2-5 words")
    explanation: str = Field(description="One plain-language sentence on why this factor mattered here")
    severity: str = Field(description="One of: low, medium, high — how much this factor drove the risk up")


class AIInsightResponse(BaseModel):
    headline: str = Field(description="One short, plain-language sentence summarizing the overall risk")
    narrative: str = Field(description="Two to three sentences of context a non-expert can understand")
    key_points: list[InsightPoint] = Field(description="One point per contributing factor, same order as top_factors")
    recommendations: list[str] = Field(description="Two to four concrete, actionable safety recommendations")
