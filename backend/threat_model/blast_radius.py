from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class BlastRadius:
    affected_users: int = 1
    affected_sessions: int = 1
    shared_asset: Optional[str] = None # e.g., IP, Subnet, API Key
    tenant_scope: bool = False # True if affects entire tenant
    reversibility_score: float = 1.0 # 1.0 = easy, 0.0 = impossible
    
    def to_dict(self) -> Dict[str, Any]:
        return {
            "affected_users": self.affected_users,
            "affected_sessions": self.affected_sessions,
            "shared_asset": self.shared_asset,
            "tenant_scope": self.tenant_scope,
            "reversibility_score": self.reversibility_score
        }

class BlastRadiusCalculator:
    """
    Estimates the impact scope of an action.
    """
    
    @staticmethod
    def calculate(action: str, target: str, context_data: Dict[str, Any]) -> BlastRadius:
        """
        Heuristic calculation of blast radius.
        In a real system, this would query session stores/IP reputation DBs.
        """
        radius = BlastRadius()
        
        # 1. Check Shared Assets (e.g. IP Blocking)
        if action in ["BLOCK_IP", "ISOLATE_HOST", "SYSTEM_ISOLATE"]:
            # Mock lookup: check if IP is shared (e.g., NAT, Corporate Proxy)
            # For now, if target looks like a CIDR or generic IP, assume potential shared impact.
            radius.shared_asset = target
            # Heuristic: System actions usually affect machine, so multiple sessions possible
            radius.affected_sessions = 5 # Placeholder estimate
            radius.reversibility_score = 0.8 # Requires admin to undo
            
        elif action == "REVOKE_TOKEN":
            radius.affected_users = 1
            radius.affected_sessions = 1
            radius.reversibility_score = 0.5 # User must login again (high friction)
            
        elif action in ["CAPTCHA", "RATE_LIMIT"]:
             radius.reversibility_score = 1.0 # Auto-expires
             
        # 2. Check Tenant Scope
        if context_data.get("is_admin_user") or "tenant" in target:
             radius.tenant_scope = True
             radius.affected_users = 100 # Placeholder for "Everyone"
             
        return radius
