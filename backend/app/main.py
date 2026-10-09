from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import accidents, analytics, health, hotspots, predict, reference
from app.core.config import settings

app = FastAPI(
    title="Urban Risk Intelligence API",
    description="Road accident analytics, hotspot detection, and severity-risk prediction.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(accidents.router)
app.include_router(analytics.router)
app.include_router(hotspots.router)
app.include_router(predict.router)
app.include_router(reference.router)
