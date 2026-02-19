from enum import Enum
from typing import Dict, Optional

class EnforcementScope(Enum):
    """
    Normalized scopes for enforcement/governance.
    Strictly defined to prevent ad-hoc scope creep.
    """
    SESSION = "SESSION"
    USER = "USER"
    TOKEN = "TOKEN"
    IP = "IP"
    CIDR = "CIDR"
    SERVICE = "SERVICE"
    TENANT = "TENANT"
    GLOBAL = "GLOBAL"

class EnforcementScopeResolver:
    """
    Helper to resolve scope from context.
    """
    @staticmethod
    def resolve_scope(context_dict: Dict) -> EnforcementScope:
        """
        Determines the appropriate scope based on available context keys.
        Priority: TENANT > USER > SESSION
        """
        # 1. Tenant Scope (Highest common denominator for multi-tenancy)
        if "tenant_id" in context_dict and context_dict.get("scope") == "TENANT":
            return EnforcementScope.TENANT
        
        # 2. User Scope
        if "user_id" in context_dict and context_dict.get("user_id"):
             # Sometimes user_id might be None or empty string
            return EnforcementScope.USER
            
        # 3. IP Scope (If explicitly requested or user unknown)
        if "ip_address" in context_dict and context_dict.get("scope") == "IP":
            return EnforcementScope.IP

        # 4. Default to Session
        return EnforcementScope.SESSION
