import uuid
import time
from dataclasses import dataclass, field, asdict
from typing import Dict, Any, Optional

@dataclass
class Event:
    """
    Strict Event Schema for the Live Predictive Intelligence System.
    Ensures all telemetry is normalized before processing.
    """
    event_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = "unknown_session"
    event_type: str = "unknown"  # http, api, auth, network, infra
    timestamp_epoch: float = field(default_factory=time.time)
    source: str = "unknown"      # web, api_gateway, firewall, server
    raw_features: Dict[str, Any] = field(default_factory=dict)
    derived_features: Dict[str, Any] = field(default_factory=dict)
    risk_score: Optional[float] = None # For Simulation/Overrides
    recommendation: Optional[str] = None # For Simulation "Action Required" box

    def to_dict(self) -> Dict[str, Any]:
        """
        Returns a Redis-compatible dictionary representation.
        """
        return asdict(self)

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> 'Event':
        """
        Reconstructs an Event object from a dictionary.
        """
        return Event(**data)
