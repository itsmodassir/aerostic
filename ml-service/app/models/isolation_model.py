import joblib
import numpy as np
from sklearn.ensemble import IsolationForest
import os

class IsolationModel:
    def __init__(self, model_path='models/isolation_forest.joblib'):
        self.model_path = model_path
        if os.path.exists(model_path):
            self.model = joblib.load(model_path)
        else:
            self.model = IsolationForest(
                n_estimators=200,
                contamination=0.02, # Assume 2% of traffic is anomalous
                random_state=42
            )

    def train(self, X):
        """
        X: 2D array-like of shape (n_samples, n_features)
        """
        self.model.fit(X)
        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)

    def predict(self, features):
        """
        features: 1D array of shape (n_features,)
        returns: (anomaly_score, is_anomaly)
        """
        X = np.array(features).reshape(1, -1)
        score = self.model.decision_function(X) # Higher score = more normal
        prediction = self.model.predict(X) # 1 for normal, -1 for anomaly
        
        return float(score[0]), int(prediction[0])
