from typing import List, Dict

class ApprovalMatrix:
    """
    Defines who is authorized to approve specific enforcement actions.
    Governance Layer.
    """
    
    # Map Action -> Required Roles
    _MATRIX = {
        "CAPTCHA": ["system", "analyst", "admin"],
        "RATE_LIMIT": ["system", "analyst", "admin"],
        "BLOCK_IP": ["analyst", "admin"],
        "ISOLATE_HOST": ["admin"], # Critical
        "REVOKE_TOKEN": ["admin"], # Critical
        "SYSTEM_ISOLATE": ["admin"] # Critical
    }
    
    # Map Threat Levels -> Minimum Role
    _THREAT_MATRIX = {
        "LOW": "system",
        "MEDIUM": "analyst",
        "HIGH": "admin",
        "CRITICAL": "admin" # Often requires DUAL approval logic handled in workflow
    }

    @classmethod
    def can_approve(cls, action: str, role: str, threat_severity: str = "LOW") -> bool:
        # 1. Check Action-based authorization
        allowed_roles = cls._MATRIX.get(action, ["admin"]) # Default to strict
        if role not in allowed_roles and "system" not in allowed_roles:
            # If system is allowed, logic might bypass role check? 
            # No, 'system' role is for auto-actions.
            pass

        if role not in allowed_roles:
            return False
            
        # 2. Check Threat-based escalation
        # If threat is HIGH, 'system' or 'analyst' cannot approve even if action is normally allowed?
        # E.g. CAPTCHA is safe, but if Threat is CRITICAL (Cascade Risk), maybe we want human?
        # Yes, Threat Override Policy handles that, but Matrix enforces hard role floors.
        
        required_role_level = cls._role_weight(cls._THREAT_MATRIX.get(threat_severity, "admin"))
        current_role_level = cls._role_weight(role)
        
        if current_role_level < required_role_level:
            return False
            
        return True

    @staticmethod
    def _role_weight(role: str) -> int:
        weights = {
            "system": 1,
            "viewer": 0,
            "analyst": 2,
            "admin": 3
        }
        return weights.get(role, 0)
