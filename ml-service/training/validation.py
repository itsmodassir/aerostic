from sklearn.metrics import silhouette_score
import numpy as np

def validate_model(model, X_scaled):
    """
    Unsupervised validation metrics
    """
    # IsolationForest doesn't have traditional accuracy, use Silhouette or similar heuristics
    labels = model.predict(X_scaled)
    unique, counts = np.unique(labels, return_counts=True)
    stats = dict(zip(unique, counts))
    
    print(f"Validation Stats: {stats}")
    # -1 is anomaly, 1 is normal
    contamination = stats.get(-1, 0) / (stats.get(1, 1) + stats.get(-1, 0))
    print(f"Observed Contamination: {contamination:.4f}")
    
    return stats
