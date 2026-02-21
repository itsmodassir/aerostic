from fastapi import FastAPI, HTTPException
from app.inference import predict_anomaly
from app.schemas import FeatureInput
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(title="Aerostic ML Service", version="1.0.0")

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "ml-engine"}

@app.post("/predict")
async def predict(data: FeatureInput):
    try:
        logger.info(f"Predicting for tenant={data.tenant_id} key={data.api_key_id}")
        result = predict_anomaly(data)
        return result
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
