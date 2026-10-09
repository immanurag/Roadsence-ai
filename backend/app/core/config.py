from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_ROOT = Path(__file__).resolve().parents[2]
PROJECT_ROOT = BACKEND_ROOT.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=BACKEND_ROOT / ".env", extra="ignore", protected_namespaces=()
    )

    duckdb_path: str = str(PROJECT_ROOT / "data" / "processed" / "urban_risk.duckdb")
    model_path: str = str(BACKEND_ROOT / "ml" / "severity_model.joblib")
    hotspot_eps_km: float = 0.5
    hotspot_min_samples: int = 8
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
