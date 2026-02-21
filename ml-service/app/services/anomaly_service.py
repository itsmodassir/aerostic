from app.models.isolation_model import IsolationModel
from app.services.feature_engineering import FeatureEngineering
from app.services.correlation_service import CorrelationService
from app.kafka_producer import KafkaProducer
import logging
import redis
import os
import json
import time

class AnomalyService:
    def __init__(self):
        self.model = IsolationModel()
        self.extractor = FeatureEngineering()
        self.correlator = CorrelationService()
        self.producer = KafkaProducer()
        self.redis = redis.Redis(
            host=os.getenv('REDIS_HOST', 'localhost'),
            port=int(os.getenv('REDIS_PORT', 6379)),
            decode_responses=True
        )
        self.logger = logging.getLogger(__name__)
        self.WINDOW_SIZE = 60 # 60 seconds

    def process_event(self, event):
        try:
            # 1. Extract Features
            features = self.extractor.extract(event)
            
            # 2. Run Inference
            score, prediction = self.model.predict(features)
            
            # 3. Handle Result
            if prediction == -1: # Anomaly detected
                self.logger.warning(f"🚨 Anomaly Detected for Tenant {event.get('tenantId')}: Score={score}")
                self.producer.emit_anomaly(event, score)
                
                # 4. CTAC Pipeline: Correlate across tenants
                self.add_to_correlation_window(event, features)
                self.run_correlation()
                
            return score, prediction
        except Exception as e:
            self.logger.error(f"Failed to process event: {e}")
            return None, None

    def add_to_correlation_window(self, event, vector):
        tenant_id = event.get('tenantId')
        timestamp = time.time()
        
        # Store vector in Redis with TTL
        data = {
            'tenant_id': tenant_id,
            'vector': vector,
            'timestamp': timestamp
        }
        
        # Use Sorted Set to keep track of concurrent anomalies
        self.redis.zadd('anomaly_window', {json.dumps(data): timestamp})
        
        # Cleanup old entries
        self.redis.zremrangebyscore('anomaly_window', '-inf', timestamp - self.WINDOW_SIZE)

    def run_correlation(self):
        # 1. Fetch all anomalies in the current window
        raw_data = self.redis.zrange('anomaly_window', 0, -1)
        anomaly_pool = [json.loads(d) for d in raw_data]
        
        # 2. Find clusters
        clusters = self.correlator.find_clusters(anomaly_pool)
        
        # 3. Emit cluster events
        for cluster in clusters:
            self.producer.produce('aerostic.platform.cluster.events', {
                'event': 'CLUSTER_DETECTED',
                'type': 'BEHAVIORAL_CORRELATION',
                'tenants': cluster,
                'risk_score': len(cluster) * 5,
                'timestamp': datetime.now().isoformat()
            })
