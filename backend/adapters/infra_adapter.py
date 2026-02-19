import time
import random
import threading
from backend.services.ingestion_service import IngestionService

class InfraAdapter:
    """
    Simulates ingestion of Infrastructure metrics (CPU, Mem).
    In a real scenario, this would scrape Prometheus or read CloudWatch logs.
    """
    
    def __init__(self, simulation_mode=True):
        self.simulation_mode = simulation_mode
        self._stop_event = threading.Event()

    def start(self):
        thread = threading.Thread(target=self._simulate_stream, daemon=True)
        thread.start()
        print("[InfraAdapter] Monitoring started (Source: Prometheus Scraper)")

    def stop(self):
        self._stop_event.set()

    def _simulate_stream(self):
        """Simulates incoming metric updates"""
        while not self._stop_event.is_set():
            if self.simulation_mode:
                # Metrics come in slower, e.g. every 10s
                time.sleep(10.0)
                
                # CPU spike logic simulation
                cpu_load = random.uniform(5.0, 30.0) 
                if random.random() < 0.1: cpu_load += 50 # Occasional spike
                
                event = {
                    "hostname": "app-server-01",
                    "cpu_load": round(cpu_load, 1),
                    "mem_usage": round(random.uniform(40, 60), 1),
                    "disk_usage": round(random.uniform(10, 30), 1),
                    "disk_io_wait": round(random.uniform(0, 1), 2),
                    "error_rate_5m": round(random.uniform(0, 0.05), 3)
                }
                
                IngestionService.ingest_infra_event(event)

