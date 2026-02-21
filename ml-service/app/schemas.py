from pydantic import BaseModel
from typing import Optional

class FeatureInput(BaseModel):
    tenant_id: str
    api_key_id: str
    message_rate_1m: float
    message_rate_5m: float
    failure_rate: float
    unique_ips: int
    geo_entropy: float
    avg_response_time: float

class PredictionOutput(BaseModel):
    tenant_id: str
    api_key_id: str
    anomaly_score: float
    risk_score: float
    is_anomaly: bool
    model_version: str
    explanation: Optional[dict] = None
