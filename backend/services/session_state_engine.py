from typing import Dict, Any, List
from datetime import datetime
from backend.contracts.event_schema import EventSchema

class SessionStateEngine:
    """
    In-Memory Session State Orchestrator.
    Maintains a window of events for each session to feed into the ML model.
    
    Note: in production, this should be backed by Redis.
    For this implementation, we use an in-memory store.
    """
    
    # { session_id: { "events": [], "meta": {} } }
    _store: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def update(cls, event: EventSchema):
        """
        Updates the session state with a new event.
        """
        sid = event.session_id
        if sid not in cls._store:
            cls._store[sid] = {
                "session_id": sid,
                "events": [],
                "created_at": event.timestamp.timestamp(), # Store as float for ML compatibility
                "created_at_iso": event.timestamp.isoformat(),
                "metadata": {}
            }
            
        session_data = cls._store[sid]
        
        # Add event to window
        # Convert Pydantic model to dict for storage
        event_dict = event.dict()
        event_dict["timestamp"] = event.timestamp.isoformat()
        
        session_data["events"].append(event_dict)
        
        # Simple aggregation logic (can be expanded)
        # Update metadata based on event type
        if event.event_type == "auth":
             # simplistic state update
             if event.payload.get("status") == "success":
                 session_data["metadata"]["authenticated"] = True
                 session_data["metadata"]["user_id"] = event.payload.get("user_id")

    @classmethod
    def get_session_context(cls, session_id: str) -> Dict[str, Any]:
        """
        Retrieves the full session context formatted for the ML pipeline.
        """
        data = cls._store.get(session_id, {})
        if not data:
            return {"session_id": session_id, "events": []}
            
        # The ML pipeline expects:
        # {
        #   "session_id": ...,
        #   "events": [ {event_dict}, ... ],
        #   "user_agent": ...,
        #   "ip": ...
        # }
        
        # We try to extract common fields from the first event or metadata
        context = data.copy()
        
        # Extract IP/UA from the latest event if available
        events = data.get("events", [])
        if events:
            last_event = events[-1]
            payload = last_event.get("payload", {})
            if "ip" in payload:
                context["ip"] = payload["ip"]
            if "user_agent" in payload:
                context["user_agent"] = payload["user_agent"]
                
        return context

    @classmethod
    def get_all_sessions(cls):
        """Debug method to view all sessions."""
        return cls._store
