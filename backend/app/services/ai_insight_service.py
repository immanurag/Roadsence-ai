from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.schemas.predict import AIInsightResponse
from app.services import reference_data as ref

_llm = None

_SYSTEM_PROMPT = """You are a road-safety analyst explaining a machine-learning \
crash-severity prediction to a member of the public who has no statistics \
background. Be concrete, plain-spoken, and brief. Never use jargon like \
"feature importance" or "probability distribution" — talk about the actual \
road conditions instead. Base every point strictly on the conditions and \
model output given to you; do not invent facts."""

_HUMAN_PROMPT = """Pre-crash conditions being evaluated:
{conditions_text}

Model output:
- Most likely outcome if a crash occurred: {predicted_severity_label}
- Estimated chance of a severe (serious/fatal) outcome: {severe_probability_pct}%
- Overall risk tier: {risk_level}
- Factors the model weighs most heavily, in order (technical names): {factor_list}

Write:
1. headline: one short sentence giving the overall verdict.
2. narrative: 2-3 plain-language sentences on what's driving this result.
3. key_points: exactly one entry per factor listed above, same order, each \
explaining in one sentence why that factor raises or lowers risk in this \
specific scenario, plus a severity of low/medium/high.
4. recommendations: 2-4 concrete actions a driver, pedestrian, or local \
authority could take in this scenario to reduce risk."""


class AIInsightError(RuntimeError):
    pass


def _get_llm():
    global _llm
    if _llm is None:
        if not settings.gemini_api_key:
            raise AIInsightError("GEMINI_API_KEY is not configured on the server.")
        _llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            api_key=settings.gemini_api_key,
            temperature=0.3,
        )
    return _llm


def _describe_conditions(conditions: dict) -> str:
    lines = [
        f"- Time: {conditions['hour']:02d}:00 on a {ref.label(ref.DAY_OF_WEEK, conditions['day_of_week_code'])}",
        f"- Road type: {ref.label(ref.ROAD_TYPE, conditions['road_type_code'])}, speed limit {conditions['speed_limit']} mph",
        f"- Junction: {ref.label(ref.JUNCTION_DETAIL, conditions['junction_detail_code'])} "
        f"(control: {ref.label(ref.JUNCTION_CONTROL, conditions['junction_control_code'])})",
        f"- Light: {ref.label(ref.LIGHT_CONDITIONS, conditions['light_conditions_code'])}",
        f"- Weather: {ref.label(ref.WEATHER_CONDITIONS, conditions['weather_conditions_code'])}",
        f"- Road surface: {ref.label(ref.ROAD_SURFACE_CONDITIONS, conditions['road_surface_conditions_code'])}",
        f"- Area: {ref.label(ref.URBAN_OR_RURAL_AREA, conditions['urban_or_rural_area_code'])}",
    ]
    return "\n".join(lines)


def generate_insight(conditions: dict, prediction: dict) -> dict:
    llm = _get_llm()
    structured_llm = llm.with_structured_output(AIInsightResponse)
    prompt = ChatPromptTemplate.from_messages(
        [("system", _SYSTEM_PROMPT), ("human", _HUMAN_PROMPT)]
    )
    chain = prompt | structured_llm

    factors = prediction["top_factors"]
    try:
        result = chain.invoke(
            {
                "conditions_text": _describe_conditions(conditions),
                "predicted_severity_label": prediction["predicted_severity_label"],
                "severe_probability_pct": round(prediction["severe_probability"] * 100, 1),
                "risk_level": prediction["risk_level"],
                "factor_list": ", ".join(f["feature"] for f in factors),
            }
        )
    except Exception as exc:  # noqa: BLE001 - surface any provider/network failure uniformly
        raise AIInsightError(f"Gemini request failed: {exc}") from exc

    return {**result.model_dump(), "model": settings.gemini_model}
