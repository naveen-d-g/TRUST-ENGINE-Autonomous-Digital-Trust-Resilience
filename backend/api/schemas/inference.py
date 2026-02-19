from dataclasses import dataclass
from typing import List, Dict, Any, Optional

@dataclass
class EventItem:
    event_type: str
    payload: Dict[str, Any]
    timestamp: Optional[str] = None

@dataclass
class InferenceRequest:
    session_id: str
    events: List[EventItem]
    
    @staticmethod
    def from_dict(data: dict):
        if "session_id" not in data or "events" not in data:
            raise ValueError("Missing required fields: session_id, events")
        
        events = [EventItem(e["event_type"], e["payload"], e.get("timestamp")) for e in data["events"]]
        return InferenceRequest(data["session_id"], events)

@dataclass
class FeedbackRequest:
    session_id: str
    label: str # BENIGN | MALICIOUS
    source: str # ANALYST | OUTCOME
    
    @staticmethod
    def from_dict(data: dict):
        if "session_id" not in data or "label" not in data or "source" not in data:
            raise ValueError("Missing required fields: session_id, label, source")
        return FeedbackRequest(data["session_id"], data["label"], data["source"])
