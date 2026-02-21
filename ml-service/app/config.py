import os

class Config:
    REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
    REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
    KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
    MODEL_PATH = os.getenv("MODEL_PATH", "app/models/isolation_forest.pkl")
    SCALER_PATH = os.getenv("SCALER_PATH", "app/models/scaler.pkl")
    DEBUG = os.getenv("DEBUG", "False").lower() == "true"
