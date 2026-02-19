import time
import random
import threading
from backend.services.ingestion_service import IngestionService

class NetworkAdapter:
    """
    Simulates ingestion of Network/Firewall events.
    In a real scenario, this would listen to NetFlow, Syslog, or PCAP.
    """
    
    def __init__(self, simulation_mode=True):
        self.simulation_mode = simulation_mode
        self._stop_event = threading.Event()

    def start(self):
        thread = threading.Thread(target=self._simulate_stream, daemon=True)
        thread.start()
        print("[NetworkAdapter] Monitoring started (Simulation: Real-time)")

    def stop(self):
        self._stop_event.set()

    def _simulate_stream(self):
        """Simulates incoming network flows"""
        while not self._stop_event.is_set():
            if self.simulation_mode:
                # Simulate a network event every few seconds
                time.sleep(random.uniform(2.0, 5.0))
                
                # Randomized payloads
                event = {
                    "src_ip": f"192.168.1.{random.randint(2, 254)}",
                    "dst_ip": "10.0.0.5",
                    "port": random.choice([80, 443, 22, 3306]),
                    "bytes": random.randint(100, 5000),
                    "flags": random.choice(["SYN", "ACK", "FIN", "RST"]),
                    "lateral_movement_score": random.random() # 0-1 score
                }
                
                IngestionService.ingest_network_event(event)

