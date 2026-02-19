from flask import g
from backend.ingestion.event_validator import EventValidator
from backend.session.session_state_engine import SessionStateEngine
from backend.ml_bridge.inference_adapter import InferenceAdapter
from backend.signals.signal_classifier import SignalClassifier
from backend.incidents.incident_manager import IncidentManager
from backend.audit.audit_logger import AuditLogger

class IngestionPipeline:
    """
    Central SOC Ingestion Logic.
    Orchestrates validation, state update, ML, signal classification, and incident management.
    """
    
    @staticmethod
    def process(raw_data: dict, domain_override: str = None):
        # 1. Validation
        event_contract = EventValidator.validate(raw_data)
        
        # Enforce Domain Correctness (Blocking Rule 1)
        if domain_override and event_contract.domain != domain_override:
             raise ValueError(f"Domain Mismatch: Endpoint expects {domain_override}, got {event_contract.domain}")
             
        # 2. State Engine
        snapshot = SessionStateEngine.update_session(event_contract)
        
        # 3. ML Inference (Read-Only)
        ml_result = InferenceAdapter.predict_risk(snapshot)
        risk_score = ml_result.get("risk_score", 0.0)
        
        # 4. Signal Classification
        signal = SignalClassifier.classify_and_store(
            session_id=event_contract.session_id,
            risk_score=risk_score,
            ml_label=ml_result.get("label", "NORMAL"),
            metadata=ml_result
        )
        
        # 5. Incident Management
        incident_id = None
        if signal.severity in ["HIGH", "CRITICAL"]:
            incident = IncidentManager.create_incident(signal)
            incident_id = incident.incident_id
            
        # 6. Audit
        AuditLogger.log(
            actor=g.user_id,
            action="EVENT_INGESTED", 
            details={
                "event_id": event_contract.event_id, 
                "risk": risk_score, 
                "signal": signal.signal_type,
                "domain": event_contract.domain
            },
            role=g.role,
            platform=g.platform,
            req_id=g.req_id
        )
        
        return {
            "event_id": event_contract.event_id,
            "risk_score": risk_score,
            "signal_id": signal.signal_id,
            "incident_id": incident_id,
            "status": "processed"
        }
