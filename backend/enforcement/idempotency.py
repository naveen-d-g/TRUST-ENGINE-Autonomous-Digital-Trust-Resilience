import hashlib
import time

class IdempotencyContract:
    """
    Generates deterministic keys for enforcement actions.
    Scope: Session + Action + Context Hash + TimeWindow
    """
    
    @staticmethod
    def generate_key(session_id: str, action: str, risk_score: float, window_seconds: int = 300) -> str:
        """
        Generates a key that remains constant for the same risk event within a time window.
        """
        time_bucket = int(time.time() / window_seconds)
        # Use int(risk_score) to group similar risks (e.g. 85.1 and 85.2 are same event likely)
        raw = f"{session_id}:{action}:{int(risk_score)}:{time_bucket}"
        return hashlib.sha256(raw.encode()).hexdigest()

    @staticmethod
    def is_retry_safe(state: str) -> bool:
        """
        Determines if an action in 'state' can be safely retried.
        """
        from backend.enforcement.state_machine.enforcement_state_machine import EnforcementState
        
        # Only FAILED actions can be retried (or partials if we track different states)
        # EXECUTING actions are locked.
        if state == EnforcementState.FAILED:
            return True
        return False
