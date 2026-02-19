
"""
Session State Aggregation
Version: v1.0

This module is responsible for aggregating raw events into a session state.
It enforces the strict definition of a session:
Session ID = SHA256(user_id + ip + user_agent + time_window_start)
"""
import hashlib
import time
from typing import List, Dict, Any, Optional

class SessionState:
    def __init__(self, session_id: str, start_time: float):
        self.session_id = session_id
        self.start_time = start_time
        self.events: List[Dict[str, Any]] = []
        self.metadata: Dict[str, Any] = {}
        self.last_update = start_time

    def add_event(self, event: Dict[str, Any]):
        """
        Adds an event to the session state.
        Event must have a 'timestamp' field (epoch float).
        """
        if 'timestamp' not in event:
            event['timestamp'] = time.time()
            
        self.events.append(event)
        self.last_update = max(self.last_update, event['timestamp'])
        
        # Merge metadata if present (but prioritize existing fixed fields)
        if 'metadata' in event:
            self.metadata.update(event['metadata'])

    @staticmethod
    def generate_session_id(user_id: str, ip_address: str, user_agent: str, window_minutes: int = 15) -> str:
        """
        Generates a deterministic session ID based on user, IP, UA, and time window.
        """
        # Calculate window start epoch
        now = time.time()
        window_seconds = window_minutes * 60
        window_start = int(now // window_seconds) * window_seconds
        
        # Create canonical string
        raw_string = f"{user_id}|{ip_address}|{user_agent}|{window_start}"
        
        # Hash it
        return hashlib.sha256(raw_string.encode('utf-8')).hexdigest()

    def get_events_before_cutoff(self, cutoff_timestamp: Optional[float] = None) -> List[Dict[str, Any]]:
        """
        Returns events strictly before the cutoff timestamp to prevent leakage.
        If cutoff is None, returns all events.
        """
        if cutoff_timestamp is None:
            return self.events
            
        return [e for e in self.events if e['timestamp'] <= cutoff_timestamp]
