import pandas as pd
import numpy as np

def build_dataset(samples=1000):
    """
    Synthetic dataset for isolation forest training
    """
    np.random.seed(42)
    
    # Normal patterns
    normal = np.random.normal(loc=[10, 8, 0.05, 1, 0.1, 150], scale=[2, 2, 0.02, 0.5, 0.05, 50], size=(samples, 6))
    
    # Anomalies (spikes & failures)
    anomalies = np.random.normal(loc=[500, 200, 0.8, 10, 2.0, 5000], scale=[100, 50, 0.1, 5, 0.5, 1000], size=(int(samples * 0.02), 6))
    
    X = np.vstack([normal, anomalies])
    
    df = pd.DataFrame(X, columns=[
        "message_rate_1m", "message_rate_5m", "failure_rate", 
        "unique_ips", "geo_entropy", "avg_response_time"
    ])
    
    return df

if __name__ == "__main__":
    df = build_dataset()
    df.to_csv("training/data.csv", index=False)
    print("Dataset generated.")
