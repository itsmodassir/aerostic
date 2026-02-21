from confluent_kafka import Consumer, KafkaError
import json
import os
import logging
from app.services.anomaly_service import AnomalyService

class KafkaConsumer:
    def __init__(self):
        conf = {
            'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
            'group.id': 'aerostic-ml-anomaly-group',
            'auto.offset.reset': 'earliest'
        }
        self.consumer = Consumer(conf)
        self.anomaly_service = AnomalyService()
        self.logger = logging.getLogger(__name__)

    def start(self):
        self.consumer.subscribe(['aerostic.usage.events'])
        self.logger.info("ML Service Consumer started. Subscribed to aerostic.usage.events")

        try:
            while True:
                msg = self.consumer.poll(1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        self.logger.error(f"Consumer error: {msg.error()}")
                        break

                try:
                    event = json.loads(msg.value().decode('utf-8'))
                    self.anomaly_service.process_event(event)
                except Exception as e:
                    self.logger.error(f"Error parsing event: {e}")
        finally:
            self.consumer.close()
