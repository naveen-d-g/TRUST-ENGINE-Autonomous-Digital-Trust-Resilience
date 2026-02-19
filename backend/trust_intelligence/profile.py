
from typing import Optional, Dict, List
from enum import Enum
from datetime import datetime
import json

class TrustTrend(str, Enum):
    IMPROVING = "IMPROVING"
    STABLE = "STABLE"
    DEGRADING = "DEGRADING"
    UNKNOWN = "UNKNOWN"

class TrustProfileScope(str, Enum):
    USER = "user_id"
    ACCOUNT = "account_id"
    DEVICE = "device_id"
    IP = "ip_address"

class TrustProfile:
    """
    Long-term trust profile for an entity.
    
    SCOPES:
    - user_id
    - account_id
    - device_id
    - ip_address
    
    INVARIANT (Phase 3 Final Patch):
    - Trust Intelligence is ADVISORY ONLY.
    - It influences: policy proposals, autonomous response confidence.
    - It MUST NOT: directly change ALLOW / RESTRICT decisions or override Phase-2.
    """
    
    def __init__(self, entity_id: str, entity_type: str = "user_id"):
        self.entity_id = entity_id
        self.entity_type = entity_type # user, account, device, ip
        self.scope = TrustProfileScope(entity_type) # Map entity_type to scope
        self.trust_score = 0.5
        self.confidence = 0.0
        self.trend = TrustTrend.UNKNOWN
        self.observation_window = "30d"
        self.last_updated = datetime.utcnow().isoformat()
        
        # History for trend detection (simplified list of recent scores)
        # In prod, this would be in a time-series DB.
        self.history: List[Dict] = [] 

    def to_dict(self) -> Dict:
        return {
            "entity_id": self.entity_id,
            "scope": self.scope.value,
            "trust_score": self.trust_score,
            "confidence": self.confidence,
            "trend": self.trend.value,
            "observation_window": self.observation_window,
            "last_updated": self.last_updated
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'TrustProfile':
        return cls(
            entity_id=data["entity_id"],
            scope=TrustProfileScope(data["scope"]),
            trust_score=data.get("trust_score", 0.5),
            confidence=data.get("confidence", 0.0),
            trend=TrustTrend(data.get("trend", "UNKNOWN")),
            observation_window=data.get("observation_window", "30d")
        )
