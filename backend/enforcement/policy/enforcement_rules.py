from typing import Dict, Any

class EnforcementRules:
    """
    Defines safety rules and automated action allowances.
    """
    
    # Safe actions that *might* be allowed automatically if policy permits
    SAFE_AUTO_ACTIONS = {"CAPTCHA", "RATE_LIMIT", "NOTIFY_SOC"}
    
    # Critical actions that ALWAYS require manual approval
    MANUAL_ONLY_ACTIONS = {"SYSTEM_ISOLATE", "REVOKE_TOKEN", "BLOCK_IP"}

    @staticmethod
    def get_allowed_action(decision: str, risk_score: float, trust_score: float) -> str:
        """
        Determines the suggested action type.
        """
        if decision == "ALLOW":
            return "NONE"
            
        if decision == "MONITOR":
            return "NOTIFY_SOC"
            
        if decision == "RESTRICT":
            # If trust is high, maybe just Captcha. If trust is low, Rate Limit.
            if trust_score > 70:
                return "CAPTCHA"
            elif trust_score > 40:
                return "RATE_LIMIT"
            else:
                return "STEP_UP_AUTH"

        if decision == "ESCALATE":
             return "MANUAL_REVIEW_REQUIRED"
             
        return "NONE"
