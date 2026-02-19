
from typing import List, Optional, Dict
from datetime import datetime
from backend.autonomous_response.action import AutonomousAction, ActionType

class AutonomousResponseEngine:
    """
    Executes high-confidence actions with strict safeguards.
    
    DEFINITION OF LOW-RISK:
    1. Risk Score < RESTRICT Threshold (60)
    2. Action is Fully Reversible (e.g. Rate Limit, Captcha)
    3. Confidence > 0.90 (Configured Minimum)
    """
    
    MIN_CONFIDENCE = 0.90 # Mandatory Gate
    
    # In-memory log for simulation. In prod -> DB.
    _action_log: List[AutonomousAction] = []
    
    @classmethod
    def propose_action(
        cls, 
        action_type: ActionType,
        target_entity: str,
        reason: str,
        confidence: float,
        duration_minutes: int = 15
    ) -> Optional[AutonomousAction]:
        """
        Attempts to execute an autonomous action.
        Returns Action if executed, None if safeguards block it.
        """
        
        # 1. Confidence Gate
        if confidence < cls.MIN_CONFIDENCE:
            print(f"Action blocked: Confidence {confidence} < {cls.MIN_CONFIDENCE}")
            return None
            
        # 2. Cool-down / Rate Limit Safeguard
        # Check if active action exists for this entity
        active_actions = [
            a for a in cls._action_log 
            if a.target_entity == target_entity 
            and a.is_active 
            and a.expires_at > datetime.utcnow().isoformat()
        ]
        
        if active_actions:
            # Policy: Do not stack actions? Or escalate?
            # For Phase 3 implementation: Simple safeguard -> No stacking.
            print(f"Action blocked: Active action exists for {target_entity}")
            return None
            
        # 3. Create & Execute
        action = AutonomousAction(
            action_type=action_type,
            target_entity=target_entity,
            reason=reason,
            confidence=confidence,
            duration_minutes=duration_minutes
        )
        
        cls._action_log.append(action)
        print(f"AUTONOMOUS ACTION: {action_type.value} on {target_entity} (Expires: {action.expires_at})")
        return action

    @classmethod
    def get_active_actions(cls) -> List[AutonomousAction]:
        now = datetime.utcnow().isoformat()
        return [
            a for a in cls._action_log 
            if a.is_active and a.expires_at > now
        ]

    @classmethod
    def revoke_action(cls, action_id: str, user: str, reason: str):
        for a in cls._action_log:
            if a.action_id == action_id:
                a.revoke(user, reason)
                return True
        return False
