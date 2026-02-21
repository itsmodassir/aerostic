import numpy as np

def calculate_risk_score(anomaly_score, confidence=1.0):
    """
    Translates raw anomaly score into a 0-100 risk score
    """
    # Simple sigmoid or linear transformation
    base_risk = min(max(anomaly_score * 100, 0), 100)
    
    # Adjust by confidence
    weighted_risk = base_risk * confidence
    
    return float(weighted_risk)

def get_risk_level(score):
    if score >= 80: return "CRITICAL"
    if score >= 50: return "HIGH"
    if score >= 20: return "WARNING"
    return "LOW"
