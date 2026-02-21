import numpy as np

class FeatureEngineering:
    def __init__(self):
        # We could implement scaling/normalization here if using pre-trained models
        pass

    def extract(self, event):
        """
        Transforms raw event into a fixed-length numerical vector
        Vector structure: [api_rate, failure_ratio, message_rate, latency_avg]
        """
        metadata = event.get('metadata', {})
        
        # 1. API Flow Rate
        api_rate = float(metadata.get('api_rate', 0))
        
        # 2. Failure Ratio (4xx/5xx vs total)
        failure_ratio = float(metadata.get('failure_ratio', 0))
        
        # 3. Message Throughput
        message_rate = float(metadata.get('message_rate', 0))
        
        # 4. Latency patterns
        latency_avg = float(metadata.get('latency_avg', 0))

        return [api_rate, failure_ratio, message_rate, latency_avg]
