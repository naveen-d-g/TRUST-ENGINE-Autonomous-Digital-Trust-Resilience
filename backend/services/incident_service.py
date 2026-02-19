from typing import List, Dict, Any
from backend.contracts.signal_types import SignalType
import uuid
from datetime import datetime

class IncidentService:
    """
    Groups signals into Incidents.
    """
    
    # In-memory store for incidents
    # { incident_id: { session_id, signals, created_at, severity, ... } }
    _incidents: Dict[str, Dict[str, Any]] = {}
    
    @classmethod
    def process_signals(cls, session_id: str, signals: List[SignalType]) -> str:
        """
        Processes new signals for a session.
        If critical signals found, creates or updates an incident.
        Returns incident_id if active, else None.
        """
        if not signals:
            return None
            
        # Check if any signal is "Critical"
        critical_signals = [s for s in signals if s in [
            SignalType.ATTACK_DETECTED, 
            SignalType.CREDENTIAL_STUFFING,
            SignalType.BRUTE_FORCE,
            SignalType.SYSTEM_FAILURE,
            SignalType.SQL_INJECTION,
            SignalType.XSS_ATTEMPT
        ]]
        
        if not critical_signals:
            return None
            
        # Check if session already has an active incident
        # This is inefficient O(N), would be DB lookup in prod
        active_incident_id = None
        for iid, data in cls._incidents.items():
            if data["session_id"] == session_id and data["status"] == "active":
                active_incident_id = iid
                break
                
        if active_incident_id:
             # Update existing
             cls._incidents[active_incident_id]["signals"].extend([s.value for s in signals])
             cls._incidents[active_incident_id]["updated_at"] = datetime.utcnow().isoformat()
             return active_incident_id
        else:
             # Create new
             new_id = str(uuid.uuid4())
             cls._incidents[new_id] = {
                 "incident_id": new_id,
                 "session_id": session_id,
                 "signals": [s.value for s in signals],
                 "status": "active",
                 "severity": "HIGH",
                 "created_at": datetime.utcnow().isoformat(),
                 "updated_at": datetime.utcnow().isoformat()
             }
             return new_id
             
    @classmethod
    def get_incident(cls, incident_id: str):
        return cls._incidents.get(incident_id)
