from flask import g
from backend.ingestion.event_validator import EventValidator
from backend.session.session_state_engine import SessionStateEngine
from backend.ml_bridge.inference_adapter import InferenceAdapter
from backend.signals.signal_classifier import SignalClassifier
from backend.incidents.incident_manager import IncidentManager
from backend.audit.audit_logger import AuditLogger
from backend.utils.hashing import compute_canonical_hash

class EventIngestor:
    """
    Strict Event Ingestion Logic.
    1. Validate Contract
    2. Compute/Verify Hash
    3. Update Session State
    4. ML Inference (Read-Only)
    5. Signal Classification
    6. Incident Correlation
    7. Audit
    """
    
    @staticmethod
    def ingest(raw_data: dict):
        # 1. Validation & Contract (🔴 BLOCKER 1)
        try:
            event = EventValidator.validate(raw_data)
        except Exception as e:
            # Prompt Requirement: "Malformed events must be rejected at ingestion with HTTP 400."
            # We need to import HTTPException first? Or just raise it and let Flask handle?
            # Prompt snippet uses: verify_soc_backend.py -> 400.
            # EventIngestor is a service, not a route. 
            # But the prompt's snippet for "backend/ingestion/event_ingestor.py" says:
            # except Exception as e: raise HTTPException(status_code=400, detail=str(e))
            from werkzeug.exceptions import BadRequest
            raise BadRequest(description=str(e))
        
        # 2. Hash Integrity (Blocking Rule 2)
        computed_hash = compute_canonical_hash(
            event.event_id, event.session_id, event.payload, event.timestamp.isoformat()
        )
        if event.canonical_hash and event.canonical_hash != computed_hash:
             raise ValueError("Integrity Error: Provided hash does not match computed hash.")
        event.canonical_hash = computed_hash # Ensure we store the correct one
             
        # 3. Session State (Blocking Rule 3)
        # SessionStateEngine expects Contract, returns Snapshot
        snapshot = SessionStateEngine.update_session(event)
        
        # 4. ML Inference (Read-Only Bridge)
        # Model expects Snapshot features
        ml_result = InferenceAdapter.predict_risk(snapshot)
        risk_score = ml_result.get("risk_score", 0.0)
        
        # 5. Signal Classification
        signal = SignalClassifier.classify_and_store(
            session_id=event.session_id,
            risk_score=risk_score,
            ml_label=ml_result.get("label", "NORMAL"),
            metadata=ml_result
        )
        
        # 6. Incident Management
        if signal.severity in ["HIGH", "CRITICAL"]: # Strict: Only High/Critical
            IncidentManager.create_incident(signal)
            
        # 7. Audit Log
        AuditLogger.log(
            actor_id=g.user_id,
            action="EVENT_INGESTED", 
            details={
                "event_id": event.event_id, 
                "risk": risk_score, 
                "signal": signal.signal_type,
                "hash": event.canonical_hash
            },
            role=getattr(g, "role", "system"),
            platform=getattr(g, "platform", "system"),
            req_id=getattr(g, "req_id", "unknown")
        )
        
        return {
            "status": "processed",
            "event_id": event.event_id,
            "risk_score": risk_score,
            "signal_id": signal.signal_id
        }
