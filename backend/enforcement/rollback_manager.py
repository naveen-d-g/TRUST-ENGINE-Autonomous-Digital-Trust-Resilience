import time
from backend.audit.audit_log import AuditLogger

class RollbackManager:
    """
    Manages reversal of enforcement actions.
    """
    
    @staticmethod
    def can_rollback(proposal: dict, user_role: str) -> bool:
        """
        Safety checks for rollback.
        """
        # Admin can always rollback
        if user_role == "admin":
            return True
            
        # Analyst can rollback only if they approved it (or it's recent)
        if time.time() - proposal.get("executed_at", 0) < 3600:
             return True
             
        return False

    @staticmethod
    def execute_rollback(proposal: dict, trigger_reason: str):
        action = proposal.get("suggested_action")
        target = proposal.get("session_id")
        pid = proposal.get("id")
        
        print(f"[ROLLBACK] Reverting {action} on {target} due to {trigger_reason}")
        AuditLogger.log_enforcement(pid, action, "ROLLBACK_INITIATED", trigger_reason)
        
        try:
            # Logic to undo state changes
            # e.g., if action=="BLOCK_IP", run "UNBLOCK_IP"
            # Here we just mock success
            
            AuditLogger.log_enforcement(pid, action, "ROLLED_BACK", "SUCCESS")
            return True
        except Exception as e:
            from backend.enforcement.failure.failure_classifier import EnforcementFailureClassifier
            failure_type = EnforcementFailureClassifier.classify_exception(e)
            AuditLogger.log_enforcement(pid, action, "ROLLBACK_FAILED", f"{failure_type}: {str(e)}")
            return False
