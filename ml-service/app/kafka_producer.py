from confluent_kafka import Producer
import json
import os

class KafkaProducer:
    def __init__(self):
        conf = {
            'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
            'client.id': 'aerostic-ml-producer'
        }
        self.producer = Producer(conf)

    def produce(self, topic, data):
        self.producer.produce(topic, json.dumps(data).encode('utf-8'))
        self.producer.flush()

    def emit_anomaly(self, event, score, model_type='isolation_forest'):
        result = {
            'event': 'ANOMALY_DETECTED',
            'tenant_id': event.get('tenantId'),
            'api_key_id': event.get('apiKeyId'),
            'score': score,
            'model': model_type,
            'original_event': event,
            'timestamp': event.get('timestamp')
        }
        self.produce('aerostic.anomaly.results', result)
