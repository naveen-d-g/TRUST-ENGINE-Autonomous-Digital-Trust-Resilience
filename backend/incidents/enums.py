from enum import Enum

class IncidentStatus(str, Enum):
    OPEN = "OPEN"
    CONTAINED = "CONTAINED"
    RECOVERING = "RECOVERING"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"

class IncidentSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
