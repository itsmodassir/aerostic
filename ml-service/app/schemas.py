from pydantic import BaseModel, Field, Extra
from typing import Optional, Dict, Any

class FeatureInput(BaseModel):
    tenant_id: str = Field(..., description="Unique ID for the tenant")
    api_key_id: str = Field(..., description="ID of the API key triggering the event")
    message_rate_1m: float = Field(default=0.0, ge=0.0)
    message_rate_5m: float = Field(default=0.0, ge=0.0)
    failure_rate: float = Field(default=0.0, ge=0.0, le=1.0)
    unique_ips: int = Field(default=1, ge=0)
    geo_entropy: float = Field(default=0.0, ge=0.0)
    avg_response_time: float = Field(default=0.0, ge=0.0)

    class Config:
        extra = Extra.forbid
        schema_extra = {
            "example": {
                "tenant_id": "9517448c-6480",
                "api_key_id": "key_8f38b409",
                "message_rate_1m": 12.5,
                "failure_rate": 0.05
            }
        }

class PredictionOutput(BaseModel):
    tenant_id: str
    api_key_id: str
    anomaly_score: float = Field(..., ge=0.0, le=100.0)
    risk_score: float = Field(..., ge=0.0, le=100.0)
    is_anomaly: bool
    model_version: str
    explanation: Optional[Dict[str, Any]] = None
    timestamp: Optional[str] = None

    class Config:
        extra = Extra.ignore
