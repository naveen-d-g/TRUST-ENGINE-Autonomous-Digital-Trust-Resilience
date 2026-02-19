from typing import Dict, Any

class EnforcementActions:
    """
    General Safe Actions.
    """
    
    @staticmethod
    def execute_action(action: str, context: Dict[str, Any]) -> bool:
        """
        Executes the action. Returns True if successful.
        """
        if action == "CAPTCHA":
            print(f"[ACTION] Enabling CAPTCHA for session {context.get('session_id')}")
            return True
        elif action == "RATE_LIMIT":
            print(f"[ACTION] Applying Rate Limit for session {context.get('session_id')}")
            return True
        elif action == "TOKEN_INVALIDATE":
            print(f"[ACTION] Invalidating Token for session {context.get('session_id')}")
            return True
        elif action == "STEP_UP_AUTH":
            print(f"[ACTION] Requiring MFA for session {context.get('session_id')}")
            return True
        elif action == "TEMP_BLOCK":
             # Time-boxed block only
            print(f"[ACTION] Temp Block (15m) for session {context.get('session_id')}")
            return True
            
        raise ValueError(f"Action {action} is NOT in the Allowed Enforcement List.")
