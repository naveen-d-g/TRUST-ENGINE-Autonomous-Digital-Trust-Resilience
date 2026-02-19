
from typing import Optional, Dict
from datetime import datetime, timedelta
import uuid
from enum import Enum

class ActionType(str, Enum):
    CAPTCHA = "CAPTCHA"
    RATE_LIMIT = "RATE_LIMIT"
    STEP_UP_AUTH = "STEP_UP_AUTH"
    TEMP_BLOCK = "TEMP_BLOCK"

class AutonomousAction:
    """
    Represents an action taken automatically by the system.
    
    INVARIANT (Phase 3 Final Patch):
    - Must include mandatory 'expires_at'.
    - Must automatically revert when expired.
    - Must leave no permanent state.
    - Must be visible to human operators and manually reversible.
    """
    
    def __init__(
        self,
        action_type: ActionType,
        target_entity: str, # IP or User ID
        reason: str,
        confidence: float,
        duration_minutes: int = 15
    ):
        self.action_id = str(uuid.uuid4())
        self.action_type = action_type
        self.target_entity = target_entity
        self.reason = reason
        self.confidence = float(confidence)
        
        self.created_at = datetime.utcnow().isoformat()
        
        # Mandatory Expiry (Final Patch Requirement)
        expires_dt = datetime.utcnow() + timedelta(minutes=duration_minutes)
        self.expires_at = expires_dt.isoformat()
        
        self.is_active = True
        self.revoked_by: Optional[str] = None
        self.revocation_reason: Optional[str] = None

    def revoke(self, user: str, reason: str):
        self.is_active = False
        self.revoked_by = user
        self.revocation_reason = reason

    def to_dict(self) -> Dict:
        return {
            "action_id": self.action_id,
            "action_type": self.action_type.value,
            "target_entity": self.target_entity,
            "reason": self.reason,
            "confidence": self.confidence,
            "created_at": self.created_at,
            "expires_at": self.expires_at,
            "is_active": self.is_active,
            "revoked_by": self.revoked_by,
            "revocation_reason": self.revocation_reason
        }
