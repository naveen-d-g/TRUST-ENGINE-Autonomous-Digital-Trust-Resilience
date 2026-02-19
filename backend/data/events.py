import uuid
import time
from datetime import datetime
from typing import Dict, List, Optional, Any
import numpy as np

class Event:
    def __init__(
        self,
        event_type: str,
        source: str,
        raw_features: Optional[Dict[str, Any]] = None,
        session_id: Optional[str] = None,
        timestamp: Optional[str] = None,
        event_id: Optional[str] = None
    ):
        self.event_id = event_id or str(uuid.uuid4())
        self.session_id = session_id or str(uuid.uuid4())
        self.event_type = event_type  # http_request, auth_attempt, api_call, etc.
        self.source = source          # web, api, network, server
        self.timestamp = timestamp or datetime.utcnow().isoformat()
        self.raw_features = raw_features or {}
        self.derived_features = {}
    
    def to_dict(self):
        return {
            "event_id": self.event_id,
            "session_id": self.session_id,
            "event_type": self.event_type,
            "source": self.source,
            "timestamp": self.timestamp,
            "raw_features": self.raw_features,
            "derived_features": self.derived_features
        }

    @property
    def timestamp_epoch(self):
        try:
            # Assume ISO format
            dt = datetime.fromisoformat(self.timestamp)
            return dt.timestamp()
        except:
            return time.time()

class SessionState:
    """
    Rolling state of a session, aggregating events over time.
    """
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.events: List[Event] = []
        
        # rolling metrics
        self.start_time = datetime.utcnow()
        self.last_activity = datetime.utcnow()
        self.request_count = 0
        self.failed_login_count = 0
        self.api_call_count = 0
        
        # Risk State
        self.current_risk_score = 0.0
        self.current_trust_score = 100.0
        
    def add_event(self, event: Event):
        self.events.append(event)
        self.last_activity = datetime.utcnow()
        
        # Update metrics based on event type
        if event.event_type == "http_request":
            self.request_count += 1
        elif event.event_type == "auth_attempt":
            if event.raw_features.get("status") == "failed":
                self.failed_login_count += 1
        elif event.event_type == "api_call":
            self.api_call_count += 1
            
    def get_features(self) -> Dict[str, Any]:
        """
        Flatten current state into feature dict for ML inference.
        """
        # Calculate duration
        duration = (self.last_activity - self.start_time).total_seconds()
        
        # Calculate rate (approx)
        rate_min = (self.request_count / (duration / 60)) if duration > 1 else 0
        
        features = {
            "session_duration_sec": duration,
            "request_rate_per_min": rate_min,
            "failed_login_attempts": self.failed_login_count,
            "api_calls_count": self.api_call_count,
            "base_trust_score": self.current_trust_score
        }
        
        # Merge latest event features (priority)
        if self.events:
            last_event = self.events[-1]
            features.update(last_event.raw_features)
            features.update(last_event.derived_features)
            
        return features
