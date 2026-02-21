from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import pandas as pd
import joblib
import os

# Generate dummy training data if not exists
DATA_PATH = "training/data.csv"
if not os.path.exists(DATA_PATH):
    os.makedirs("training", exist_ok=True)
    # Create synthetic dataset: normal traffic + few anomalies
    import numpy as np
    normal = np.random.normal(loc=10, scale=2, size=(1000, 6))
    anomalies = np.random.normal(loc=50, scale=10, size=(20, 6))
    X_train = np.vstack([normal, anomalies])
    
    df = pd.DataFrame(X_train, columns=[
        "message_rate_1m", "message_rate_5m", "failure_rate", 
        "unique_ips", "geo_entropy", "avg_response_time"
    ])
    df.to_csv(DATA_PATH, index=False)
    print(f"Generated synthetic training data at {DATA_PATH}")

# Training Pipeline
df = pd.read_csv(DATA_PATH)
X = df[[
    "message_rate_1m",
    "message_rate_5m",
    "failure_rate",
    "unique_ips",
    "geo_entropy",
    "avg_response_time"
]]

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

model = IsolationForest(
    n_estimators=200,
    contamination=0.02, # 2% anomaly rate
    random_state=42
)

model.fit(X_scaled)

# Save Assets
os.makedirs("app/models", exist_ok=True)
joblib.dump(model, "app/models/isolation_forest.pkl")
joblib.dump(scaler, "app/models/scaler.pkl")

print("✅ Model and Scaler trained and saved to app/models/")
