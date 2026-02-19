from flask import abort
from backend.incidents.enums import IncidentStatus

VALID_TRANSITIONS = {
    IncidentStatus.OPEN: {IncidentStatus.CONTAINED},
    IncidentStatus.CONTAINED: {IncidentStatus.RECOVERING},
    IncidentStatus.RECOVERING: {IncidentStatus.RESOLVED},
    IncidentStatus.RESOLVED: {IncidentStatus.CLOSED},
}

def transition_status(incident, new_status):
    if incident.status == new_status:
        return # Idempotent success
    
    allowed = VALID_TRANSITIONS.get(incident.status, set())
    if new_status not in allowed:
        abort(403, description=f"Invalid transition from {incident.status} to {new_status}")
    
    incident.status = new_status
    # Log to Audit later
    return incident
