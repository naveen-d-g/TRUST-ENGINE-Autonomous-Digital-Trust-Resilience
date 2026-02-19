from dataclasses import dataclass, field
from typing import Dict, Any, List, Optional
import time
import uuid

@dataclass(frozen=True)
class ExecutionContext:
    """
    Immutable context for an Orchestration/Enforcement flow.
    Traceable across the entire pipeline.
    """
    trace_id: str = field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str = "unknown"
    tenant_id: Optional[str] = None
    user_id: Optional[str] = None
    
    # ML Outputs
    risk_score: float = 0.0
    decision: str = "ALLOW"
    breakdown: Dict[str, float] = field(default_factory=dict)
    
    # Trust & History
    trust_score: float = 100.0
    risk_velocity: float = 0.0
    session_age: float = 0.0
    
    # Governance
    model_version: str = "unknown"
    policy_version: str = "unknown"
    
    # Operational Safety (Threat Model)
    threat_assessment: Optional[Dict[str, Any]] = None
    
    timestamp: float = field(default_factory=time.time)
    expires_at: float = field(default_factory=lambda: time.time() + 300) # 5 min TTL
    
    def is_expired(self) -> bool:
        return time.time() > self.expires_at

    def to_dict(self) -> Dict[str, Any]:
        return {
            "trace_id": self.trace_id,
            "session_id": self.session_id,
            "user_id": self.user_id,
            "risk_score": self.risk_score,
            "decision": self.decision,
            "trust_score": self.trust_score,
            "threat_assessment": self.threat_assessment,
            "timestamp": self.timestamp,
            "expires_at": self.expires_at
        }
