import joblib
import numpy as np
import os
from app.schemas import FeatureInput

# Path to models
MODEL_PATH = "app/models/isolation_forest.pkl"
SCALER_PATH = "app/models/scaler.pkl"

# Global lazy loaders
model = None
scaler = None

def load_models():
    global model, scaler
    if model is None and os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    if scaler is None and os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)

def predict_anomaly(data: FeatureInput):
    load_models()
    
    if model is None or scaler is None:
        return {
            "tenant_id": data.tenant_id,
            "api_key_id": data.api_key_id,
            "anomaly_score": 0.0,
            "risk_score": 0.0,
            "is_anomaly": False,
            "model_version": "v0.0.0 (Fallback)"
        }

    features = np.array([[
        data.message_rate_1m,
        data.message_rate_5m,
        data.failure_rate,
        data.unique_ips,
        data.geo_entropy,
        data.avg_response_time
    ]])

    scaled = scaler.transform(features)

    # decision_function returns the mean anomaly score of a sample. 
    # High score = normal, low score = anomaly.
    score = model.decision_function(scaled)[0]
    prediction = model.predict(scaled)[0]

    # Convert to 0-1 anomaly score (1 = most anomalous)
    # IsolationForest score range is roughly [-0.5, 0.5]
    anomaly_score = float(0.5 - score) 
    is_anomaly = prediction == -1

    # Calculate 1-100 risk score
    risk = min(max(anomaly_score * 100, 0), 100)

    return {
        "tenant_id": data.tenant_id,
        "api_key_id": data.api_key_id,
        "anomaly_score": anomaly_score,
        "risk_score": risk,
        "is_anomaly": is_anomaly,
        "model_version": "v1.0.0"
    }
