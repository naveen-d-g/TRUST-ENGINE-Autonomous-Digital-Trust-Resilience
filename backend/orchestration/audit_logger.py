import logging
import json
from typing import Dict, Any

# Configure structured logger
audit_logger = logging.getLogger("audit_logger")
audit_logger.setLevel(logging.INFO)
# Prevent propagation to root logger to avoid dups if configured elsewhere
audit_logger.propagate = False

if not audit_logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - AUDIT - %(message)s')
    handler.setFormatter(formatter)
    audit_logger.addHandler(handler)

class AuditLogger:
    """
    Central audit logging for Security Platform.
    Using structured JSON logging for SIEM ingestion.
    """
    
    @staticmethod
    def log_decision(context_dict: Dict[str, Any], outcome: str, details: str = ""):
        event = {
            "type": "SECURITY_DECISION",
            "trace_id": context_dict.get("trace_id"),
            "session_id": context_dict.get("session_id"),
            "decision": context_dict.get("decision"),
            "risk_score": context_dict.get("risk_score"),
            "outcome": outcome,
            "details": details
        }
        audit_logger.info(json.dumps(event))

    @staticmethod
    def log_enforcement(proposal_id: str, action: str, status: str, triggered_by: str):
        event = {
            "type": "ENFORCEMENT_ACTION",
            "proposal_id": proposal_id,
            "action": action,
            "status": status, # PENDING, APPROVED, EXECUTED
            "triggered_by": triggered_by
        }
        audit_logger.info(json.dumps(event))

    @staticmethod
    def log_system_event(event_type: str, message: str, severity: str = "INFO"):
        event = {
            "type": "SYSTEM_EVENT",
            "event_type": event_type,
            "message": message,
            "severity": severity
        }
        audit_logger.info(json.dumps(event))
