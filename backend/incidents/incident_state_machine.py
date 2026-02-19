from enum import Enum

class IncidentState(str, Enum):
    OPEN = "OPEN"
    CONTAINED = "CONTAINED"
    RECOVERING = "RECOVERING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

# 🔴 BLOCKER 3 – Incident Lifecycle Enforcement
VALID_TRANSITIONS = {
    IncidentState.OPEN: [IncidentState.CONTAINED],
    IncidentState.CONTAINED: [IncidentState.RECOVERING],
    IncidentState.RECOVERING: [IncidentState.RESOLVED],
    IncidentState.RESOLVED: [IncidentState.CLOSED],
    IncidentState.CLOSED: [] # End state
}
