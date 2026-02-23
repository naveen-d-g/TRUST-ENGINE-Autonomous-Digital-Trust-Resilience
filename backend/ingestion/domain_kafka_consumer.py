import os
import json
import threading
from confluent_kafka import Consumer, KafkaException, KafkaError
from backend.ingestion.event_ingestor import EventIngestor
import time
import logging

logger = logging.getLogger(__name__)

KAFKA_BROKER = os.environ.get('KAFKA_BROKER', 'localhost:9092')
TOPICS = ['web-events', 'api-events', 'network-events', 'system-events']

class DomainKafkaConsumer:
    def __init__(self):
        self.consumer = Consumer({
            'bootstrap.servers': KAFKA_BROKER,
            'group.id': 'trust_engine_domain_consumer',
            'auto.offset.reset': 'latest',
            'enable.auto.commit': True
        })
        self.running = False
        
    def _validate_and_ingest(self, msg_value):
        try:
            raw_data = json.loads(msg_value.decode('utf-8'))
            logger.info(f"Received event on domain [{raw_data.get('domain')}]: {raw_data.get('event_id')}")
            
            # Use strict pipeline (Blocker 1 - EventValidator, Blocker 2 - Hash Integrity)
            result = EventIngestor.ingest(raw_data)
            logger.info(f"Successfully ingrained event: {result}")
            
        except json.JSONDecodeError:
            logger.error("Malformed JSON in Kafka message.", exc_info=True)
        except Exception as e:
            logger.error(f"Event ingestion failed: {e}", exc_info=True)

    def start(self):
        self.running = True
        try:
            self.consumer.subscribe(TOPICS)
            logger.info(f"Subscribed to specific domain topics: {TOPICS}")
            
            while self.running:
                msg = self.consumer.poll(timeout=1.0)
                if msg is None:
                    continue
                if msg.error():
                    if msg.error().code() == KafkaError._PARTITION_EOF:
                        continue
                    else:
                        raise KafkaException(msg.error())
                
                self._validate_and_ingest(msg.value())
                
        except Exception as e:
            logger.error(f"Kafka Consumer Loop crashed: {e}")
        finally:
            self.consumer.close()
            
    def stop(self):
        self.running = False

def start_domain_consumer():
    consumer = DomainKafkaConsumer()
    thread = threading.Thread(target=consumer.start, daemon=True)
    thread.start()
    return consumer
