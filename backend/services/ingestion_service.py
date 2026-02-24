
from backend.services.observation_service import SessionStateEngine
from backend.services.inference_service import InferenceService
from backend.data.event_schema import Event
import uuid
import time
import threading

class IngestionService:
    """
    Ingests raw events, normalizes them, and updates the session state.
    Designed to be the entry point for all live monitoring signals.
    """
    
    @staticmethod
    def ingest_http_event(payload):
        """
        Ingest a web access log / HTTP request event.
        Payload expected: { method, path, status_code, ip, user_agent, ... }
        """
        return IngestionService._process_event(
            IngestionService._normalize_event(payload, "http", source="web")
        )

    @staticmethod
    def ingest_api_event(payload):
        """
        Ingest an API usage event.
        Payload expected: { endpoint, token_id, usage_count, ... }
        """
        return IngestionService._process_event(
            IngestionService._normalize_event(payload, "api", source="api_gateway")
        )
        
    @staticmethod
    def ingest_auth_event(payload):
        """
        Ingest an Authentication event (Login, Logout, MFA).
        Payload expected: { user_id, status, ... }
        """
        return IngestionService._process_event(
            IngestionService._normalize_event(payload, "auth", source="auth_service")
        )

    @staticmethod
    def ingest_network_event(payload):
        """
        Ingest generic network signals (Firewall, IDS).
        """
        return IngestionService._process_event(
            IngestionService._normalize_event(payload, "network", source="firewall")
        )

    @staticmethod
    def ingest_infra_event(payload):
        """
        Ingest infrastructure metrics (CPU, RAM).
        """
        return IngestionService._process_event(
             IngestionService._normalize_event(payload, "infra", source="server")
        )

    @staticmethod
    def _normalize_event(payload, event_type, source="unknown"):
        """
        Converts raw payload to standard Event Schema.
        """
        # Ensure session_id exists or generate one (e.g. from IP if cookie missing)
        session_id = payload.get("session_id")
        if not session_id:
            # Fallback logic: stickiness by IP? 
            # For now, generate random if missing, but ideally passed by caller
            session_id = payload.get("ip_address", "unknown_session")
            
        actor_id = payload.get("actor_id")
        
        # separate raw features from metadata
        raw_features = payload.copy()
        if "session_id" in raw_features: del raw_features["session_id"]
        if "actor_id" in raw_features: del raw_features["actor_id"]
        
        # 🧪 INFRA/NETWORK FLATTENING: Ensure frontend sees a flat dictionary
        # If 'features' exists (from common adapters), merge it upward
        if "features" in raw_features and isinstance(raw_features["features"], dict):
            features_data = raw_features.pop("features")
            raw_features.update(features_data)
        
        event = Event(
            session_id=str(session_id),
            actor_id=str(actor_id) if actor_id else None,
            event_type=event_type,
            source=source,
            timestamp_epoch=time.time(),
            raw_features=raw_features
        )
        
        # 🧪 SIMULATION BYPASS: Allow injecting risk_score directly
        if "risk_score" in payload:
            event.risk_score = payload["risk_score"]
        if "recommendation" in payload:
            event.recommendation = payload["recommendation"]
        
        return event

    @staticmethod
    def _process_event(event: Event):
        """
        Core pipeline:
        1. Update State (Fast, Atomic-ish)
        2. Trigger Inference (Async-ready)
        """
        
        # 1. Update State
        session_id = event.session_id
        SessionStateEngine.update_session_state(session_id, event)
        
        # 1.5 Update Risk History (Essential for Frontend Trend/Velocity)
        if hasattr(event, 'risk_score'):
            SessionStateEngine.update_risk_history(session_id, event.risk_score)
        
        # 2. Trigger Inference
        result = IngestionService._trigger_inference(session_id, event)
        
        return {
            "status": "accepted",
            "event_id": event.event_id,
            "risk_assessment": result # Return for immediate feedback if compatible
        }

    @staticmethod
    def _trigger_inference(session_id, triggering_event: Event):
        """
        Collect features and call the Brain.
        """
        # A. Fetch Raw Session State from State Engine
        # The Inference Pipeline expects the raw state to perform its own extraction
        # A. Fetch Raw Session State from State Engine
        # The Inference Pipeline expects the raw state to perform its own extraction
        raw_session = SessionStateEngine._sessions.get(session_id)
        if not raw_session:
            return {"error": "session_not_found"}
            
        # Create a shallow copy to safely modify for inference without affecting state
        session_copy = raw_session.copy()
        
        # Serialize 'events' deque/list of Event objects to list of dicts
        # B. Prepare Inference Request
        # Serialize 'events' deque/list of Event objects to list of dicts safely
        if "events" in session_copy:
            # Create a localized deep copy of the events list to avoid 
            # 'RuntimeError: deque mutated during iteration' from concurrent REST requests
            safe_events = list(session_copy["events"])
            session_copy["events"] = [e.to_dict() for e in safe_events]
        # B. Prepare Inference Request
        inference_payload = {
            "session_id": session_id,
            "user_id": triggering_event.raw_features.get("user_id"),
            "features": session_copy,
            "trigger": triggering_event.event_type
        }

        # 🧪 SIMULATION: Propagate forced risk score to inference
        if hasattr(triggering_event, 'risk_score'):
            inference_payload['force_risk_score'] = triggering_event.risk_score
        
        if hasattr(triggering_event, 'recommendation') and triggering_event.recommendation:
            inference_payload['force_recommendation'] = triggering_event.recommendation
        
        # C. Call Inference Service
        # This writes to DB and returns full decision
        try:
             result = InferenceService.evaluate_session(inference_payload)
             return result
        except Exception as e:
            print(f"Inference trigger failed: {e}")
            return {"error": "inference_failed"}
