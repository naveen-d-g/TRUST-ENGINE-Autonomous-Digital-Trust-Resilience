from backend.contracts.event_contract import EventContract
from typing import List, Dict

class SessionSnapshot:
    def __init__(self, session_id: str, events: List[EventContract]):
        self.session_id = session_id
        self.events = events

class SessionStateEngine:
    def __init__(self):
        self._buffer: Dict[str, List[EventContract]] = {}

    def ingest(self, event: EventContract):
        """Buffer a validated event in memory."""
        if event.session_id not in self._buffer:
            self._buffer[event.session_id] = []
        self._buffer[event.session_id].append(event)

    def snapshot(self, session_id: str) -> SessionSnapshot:
        """Create a point-in-time snapshot of the session."""
        events = self._buffer.get(session_id, [])
        return SessionSnapshot(session_id, events)

    def clear(self, session_id: str):
        """Clear the buffer for a session (e.g. after successful processing or timeout)."""
        if session_id in self._buffer:
            del self._buffer[session_id]
