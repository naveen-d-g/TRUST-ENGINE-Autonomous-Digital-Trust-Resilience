from typing import List, Dict, Any
import time

class SystemSequenceBuilder:
    """
    Builds temporal sequences of system events for the Temporal Intrusion Model.
    Focuses on: Syscalls, Process Spawns, File Modifications.
    """
    
    # In-memory buffer: SessionID -> List[Event]
    # Pruned periodically.
    _buffers: Dict[str, List[Dict[str, Any]]] = {}
    MAX_SEQ_LEN = 20
    TIME_WINDOW = 60.0 # seconds

    @classmethod
    def add_event(cls, session_id: str, event_type: str, metadata: Dict[str, Any]):
        """
        Adds an event to the session's temporal sequence.
        """
        if session_id not in cls._buffers:
            cls._buffers[session_id] = []
            
        seq = cls._buffers[session_id]
        now = time.time()
        
        # Add new event
        seq.append({
            "type": event_type, 
            "timestamp": now,
            "meta": metadata
        })
        
        # Prune old events
        cls._prune_sequence(seq, now)
        
        # Limit length
        if len(seq) > cls.MAX_SEQ_LEN:
            seq.pop(0)

    @classmethod
    def get_sequence(cls, session_id: str) -> List[Dict[str, Any]]:
        return cls._buffers.get(session_id, [])

    @staticmethod
    def _prune_sequence(seq: List[Dict[str, Any]], now: float):
        """Removes events older than TIME_WINDOW"""
        while seq and (now - seq[0]["timestamp"] > SystemSequenceBuilder.TIME_WINDOW):
            seq.pop(0)
