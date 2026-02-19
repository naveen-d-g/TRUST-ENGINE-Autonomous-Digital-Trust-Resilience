import psutil
import time
import threading
from backend.services.ingestion_service import IngestionService
from backend.utils.logger import log_error, log_info

class InfraCollector:
    """
    Adapter for Infrastructure Monitoring.
    Collects CPU, Memory, Disk, and Network I/O metrics.
    Runs in a non-blocking background thread.
    """
    
    _instance = None
    _running = False
    _thread = None
    _app = None

    @classmethod
    def start_collector(cls, app=None):
        if cls._running:
            return
        
        cls._app = app
        cls._running = True
        cls._thread = threading.Thread(target=cls._collection_loop, daemon=True)
        cls._thread.start()
        log_info("InfraCollector started in background thread")

    @classmethod
    def stop_collector(cls):
        cls._running = False
        if cls._thread:
            cls._thread.join(timeout=2)
            log_info("InfraCollector stopped")

    @classmethod
    def _collection_loop(cls):
        while cls._running:
            try:
                metrics = cls._collect_metrics()
                
                if cls._app:
                    with cls._app.app_context():
                        cls._emit_event(metrics)
                else:
                    cls._emit_event(metrics)
                    
                time.sleep(5) # 5 Second Interval
            except Exception as e:
                log_error("InfraCollector Loop Error", str(e))
                time.sleep(5) # Prevent tight loop on error

    @classmethod
    def _collect_metrics(cls):
        return {
            "cpu_percent": psutil.cpu_percent(interval=1), # This blocks for 1s! But in thread it's fine.
            "memory_percent": psutil.virtual_memory().percent,
            "disk_usage": psutil.disk_usage('/').percent,
            "net_io": psutil.net_io_counters()._asdict()
        }

    @classmethod
    def _emit_event(cls, metrics):
        # Determine Severity
        severity = "info"
        if metrics["cpu_percent"] > 80 or metrics["memory_percent"] > 90:
            severity = "medium"
        if metrics["cpu_percent"] > 95:
            severity = "high"

        # Normalized Event Schema
        event = {
            "event_type": "infra",
            "timestamp": time.time(),
            "session_id": "sys_mon_01",
            "severity": severity,
            "features": {
                "cpu_load": metrics["cpu_percent"],
                "mem_usage": metrics["memory_percent"],
                "disk_usage": metrics["disk_usage"],
                "bytes_sent": metrics["net_io"].get("bytes_sent", 0),
                "bytes_recv": metrics["net_io"].get("bytes_recv", 0)
            }
        }
        
        IngestionService.ingest_infra_event(event)

