
import logging
import json
import os
from datetime import datetime, timezone
from backend.config import Config
LOG_FILE = Config.LOG_FILE

class JSONFormatter(logging.Formatter):
    """
    Custom formatter to output logs in JSON format.
    """
    def format(self, record):
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "func": record.funcName
        }
        
        # Merge extra context if available
        if hasattr(record, "context"):
            log_entry.update(record.context)
            
        return json.dumps(log_entry)

def setup_logger():
    """
    Configures the centralized logger for the trust engine.
    """
    logger = logging.getLogger("trust_engine")
    logger.setLevel(logging.INFO)
    
    # Avoid duplicate handlers if already setup
    if not logger.handlers:
        # File Handler
        file_handler = logging.FileHandler(LOG_FILE)
        file_handler.setFormatter(JSONFormatter())
        logger.addHandler(file_handler)
        
        # Console Handler (Optional for debugging)
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(JSONFormatter())
        logger.addHandler(console_handler)
        
    return logger

# Singleton instance
logger = setup_logger()

def log_decision(session_id, trust_score, final_decision, primary_cause, recommended_action, endpoint, response_time_ms):
    """
    Convenience method for logging security decisions.
    """
    context = {
        "session_id": session_id,
        "trust_score": trust_score,
        "final_decision": final_decision,
        "primary_cause": primary_cause,
        "recommended_action": recommended_action,
        "endpoint_name": endpoint,
        "response_time_ms": response_time_ms
    }
    logger.info(f"Trust Evaluation: {final_decision}", extra={"context": context})

def log_error(message, endpoint=None, session_id=None, error=None):
    """
    Convenience method for logging errors.
    """
    context = {}
    if endpoint: context["endpoint_name"] = endpoint
    if session_id: context["session_id"] = session_id
    if error: context["error_detail"] = str(error)
    
    logger.error(message, extra={"context": context})

def log_info(message, **kwargs):
    """
    Convenience method for logging info.
    """
    logger.info(message, extra={"context": kwargs})
