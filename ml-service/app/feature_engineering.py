from app.schemas import FeatureInput
import numpy as np

def process_features(data: FeatureInput):
    """
    Additional feature engineering (e.g., log transforms, ratios)
    """
    # Example: Calculate a 'burst_multiplier'
    burst_multiplier = data.message_rate_1m / (data.message_rate_5m + 1e-6)
    
    return [
        data.message_rate_1m,
        data.message_rate_5m,
        data.failure_rate,
        data.unique_ips,
        data.geo_entropy,
        data.avg_response_time,
        burst_multiplier
    ]
