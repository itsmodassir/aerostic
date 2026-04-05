import logging
import threading
from fastapi import FastAPI, HTTPException, BackgroundTasks
from app.inference import predict_anomaly
from app.schemas import FeatureInput, PredictionOutput
from app.kafka_consumer import KafkaConsumer

# Configure Logging - Standardized for Production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("ml.service")

app = FastAPI(
    title="Aerostic ML Intelligence Engine",
    version="2.5.0",
    description="High-fidelity anomaly detection and risk scoring service"
)

# Shared Consumer Instance
kafka_worker = KafkaConsumer()

def run_kafka_consumer():
    """Background worker thread function"""
    try:
        logger.info("Starting background Kafka consumer thread...")
        kafka_worker.start()
    except Exception as e:
        logger.critical(f"Kafka worker thread crashed: {e}", exc_info=True)

@app.on_event("startup")
async def startup_event():
    """Lifecycle hook: Startup"""
    logger.info("Initializing Aerostic ML Service Infrastructure...")
    # Start consumer in a non-blocking background thread
    thread = threading.Thread(target=run_kafka_consumer, daemon=True)
    thread.start()

@app.on_event("shutdown")
async def shutdown_event():
    """Lifecycle hook: Shutdown"""
    logger.info("Platform shutting down. Terminating ML intelligence vectors...")
    kafka_worker.stop()

@app.get("/health")
async def health():
    """Infrastructure probe"""
    return {
        "status": "healthy",
        "service": "ml-engine",
        "version": "2.5.0",
        "vector": "anomaly-detectionv4",
        "kafka_active": kafka_worker.running
    }

@app.post("/predict", response_model=PredictionOutput)
async def predict(data: FeatureInput):
    """Direct Inference Endpoint"""
    try:
        logger.info(f"Direct inference request for tenant={data.tenant_id}")
        result = predict_anomaly(data)
        return result
    except Exception as e:
        logger.error(f"Inference pipeline failure: {e}")
        raise HTTPException(status_code=500, detail="Intelligence synthesis failed.")

if __name__ == "__main__":
    import uvicorn
    # In production, use gunicorn with uvicorn workers
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
