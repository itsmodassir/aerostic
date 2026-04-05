import json
import os
import logging
import signal
import time
from confluent_kafka import Consumer, KafkaError
from app.services.anomaly_service import AnomalyService

class KafkaConsumer:
    def __init__(self):
        conf = {
            'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092'),
            'group.id': os.getenv('KAFKA_GROUP_ID', 'aerostic-ml-anomaly-group'),
            'auto.offset.reset': 'earliest',
            'enable.auto.commit': True,
            'session.timeout.ms': 6000,
            'heartbeat.interval.ms': 2000,
        }
        self.consumer = Consumer(conf)
        self.anomaly_service = AnomalyService()
        self.logger = logging.getLogger("ml.kafka.consumer")
        self.running = True

        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._handle_exit)
        signal.signal(signal.SIGTERM, self._handle_exit)

    def _handle_exit(self, signum, frame):
        self.logger.info(f"Received exit signal ({signum}). Shutting down consumer...")
        self.running = False

    def start(self):
        topic = os.getenv('KAFKA_TOPIC', 'aerostic.usage.events')
        self.consumer.subscribe([topic])
        self.logger.info(f"ML Service Consumer active. Subscribed to topic: {topic}")

        try:
            while self.running:
                # Poll for messages with a timeout
                msg = self.consumer.poll(1.0)
                
                if msg is None:
                    continue
                
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        # End of partition event
                        self.logger.debug(f"Reached end of partition: {msg.topic()} [{msg.partition()}] at offset {msg.offset()}")
                        continue
                    else:
                         self.logger.error(f"Kafka error encountered: {msg.error()}")
                         # Sleep briefly to avoid tight error loops
                         time.sleep(1)
                         continue

                # Process the message
                try:
                    raw_data = msg.value().decode('utf-8')
                    event = json.loads(raw_data)
                    
                    # Core processing logic
                    self.anomaly_service.process_event(event)
                    
                except json.JSONDecodeError as je:
                    self.logger.error(f"Malformed JSON event received: {je}")
                except Exception as e:
                    self.logger.error(f"Critical error processing event: {e}", exc_info=True)

        except Exception as e:
            self.logger.critical(f"Unexpected consumer failure: {e}")
        finally:
            # Cleanly close the consumer and commit offsets
            self.logger.info("Closing Kafka consumer connection...")
            self.consumer.close()
            self.logger.info("ML Service Consumer shutdown complete.")

    def stop(self):
        """Programmatic trigger for shutdown"""
        self.running = False
