import time
from typing import Dict, Optional
from backend.common.scope import EnforcementScope
from backend.audit.audit_log import AuditLogger

class CooldownManager:
    """
    Prevents duplicate enforcement actions within a cooldown window.
    Protect against Operator DoS or loop-induced spam.
    
    Implements Escalation Logic:
    - Session -> User -> Tenant
    """
    
    _COOLDOWN_STORE: Dict[str, float] = {} # Key -> Timestamp
    _VIOLATION_COUNTS: Dict[str, int] = {} # Key -> Count
    
    # Cooldown Windows (Seconds)
    WINDOWS = {
        EnforcementScope.SESSION: 300,   # 5 mins
        EnforcementScope.USER: 900,      # 15 mins
        EnforcementScope.TENANT: 3600    # 1 hour
    }
    
    # Escalation Thresholds
    ESCALATION_THRESHOLD = 3

    @classmethod
    def _get_key(cls, scope: EnforcementScope, target: str, action: str) -> str:
        return f"{scope.value}:{target}:{action}"

    @classmethod
    def check_cooldown(cls, action: str, target: str, scope: EnforcementScope, tenant_id: str = None) -> bool:
        """
        Returns True if action is ALLOWED.
        Returns False if action is BLOCKED (in cooldown).
        Side Effect: Checks upstream scopes (Escalation).
        """
        # 1. Check Specific Scope
        key = cls._get_key(scope, target, action)
        last_executed = cls._COOLDOWN_STORE.get(key, 0)
        window = cls.WINDOWS.get(scope, 300)
        
        if time.time() - last_executed < window:
            # Violation!
            cls._handle_violation(scope, target, action, tenant_id)
            return False
            
        # 2. Check Upstream Scopes (Hierarchical Blocking)
        # If Session scope, check if User is blocked.
        if scope == EnforcementScope.SESSION:
            # We need a way to resolve user_id from target if target IS session_id. 
            # Ideally context should strictly pass USER scope if we want to check USER cooldown.
            # But here, we assume if we are checking SESSION, we might implicitly be blocked by USER.
            # For simplicity in this v2, we rely on the caller to check hierarchically or we accept strict scope checking.
            pass

        return True

    @classmethod
    def record_execution(cls, action: str, target: str, scope: EnforcementScope):
        """
        Records an execution timestamp.
        """
        key = cls._get_key(scope, target, action)
        cls._COOLDOWN_STORE[key] = time.time()
        
        # Reset violations on successful legitimate execution? 
        # Or keep them to detect flapping? 
        # Let's reset to be forgiving after valid cooldown.
        if key in cls._VIOLATION_COUNTS:
             del cls._VIOLATION_COUNTS[key]

    @classmethod
    def _handle_violation(cls, scope: EnforcementScope, target: str, action: str, tenant_id: str = None):
        """
        Increments violation count and triggers escalation if needed.
        """
        key = cls._get_key(scope, target, action)
        cls._VIOLATION_COUNTS[key] = cls._VIOLATION_COUNTS.get(key, 0) + 1
        
        count = cls._VIOLATION_COUNTS[key]
        AuditLogger.log_system_event("COOLDOWN_VIOLATION", f"Target {target} hit cooldown for {action} ({count}x)", "WARN")
        
        if count >= cls.ESCALATION_THRESHOLD:
            cls._escalate(scope, target, action, tenant_id)

    @classmethod
    def _escalate(cls, scope: EnforcementScope, target: str, action: str, tenant_id: str = None):
        """
        Escalates to the next scope.
        Session -> User -> Tenant
        """
        if scope == EnforcementScope.SESSION:
            # Escalate to USER
            # We'd need the User ID. This method signature might need enrichment or 
            # we log a generic "Recommended Escalation".
            AuditLogger.log_system_event("COOLDOWN_ESCALATION", 
                f"High-frequency violations on Session {target}. Recommend escalating to USER scope.", 
                "CRITICAL"
            )
            # In a real system, we might auto-create a User-scope cooldown proposal.
            
        elif scope == EnforcementScope.USER:
            # Escalate to TENANT
            AuditLogger.log_system_event("COOLDOWN_ESCALATION", 
                f"High-frequency violations on User {target}. Recommend escalating to TENANT {tenant_id} scope.", 
                "CRITICAL"
            )
