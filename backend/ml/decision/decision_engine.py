from typing import Dict, Any, Optional
from backend.ml.decision.policy_engine import PolicyEngine
from backend.ml.decision.prevention_modes import DecisionType

class DecisionEngine:
    """
    Final decision authority.
    Combines Risk Score (Policy) + Manual Overrides.
    """
    
    @staticmethod
    def decide(risk_score: float, features: Dict[str, Any], context: Dict[str, Any] = None) -> Dict[str, Any]:
        context = context or {}
        
        # 1. Run Policy Engine
        policy_result = PolicyEngine.apply_policy(risk_score, features)
        decision = policy_result["decision"]
        audit = policy_result["audit"]
        
        # 2. Check for Manual Overrides (Admin/Analyst)
        # Context usually comes from the API request handling layer
        
        # HARD OVERRIDE: If "manual_decision" is present in context (e.g. from Admin Dashboard)
        if "manual_decision" in context and context["manual_decision"]:
            decision = context["manual_decision"] # e.g. "ESCALATE"
            audit["override_applied"] = True
            audit["override_by"] = context.get("user_role", "unknown")
            audit["override_reason"] = "Manual Admin Action"
            
        # 3. Check for specific Critical Flags (Hybrid Logic)
        # Even if score is low, some flags might force MONITOR
        if features.get("token_reuse_count", 0) > 0 and decision == DecisionType.ALLOW:
            decision = DecisionType.MONITOR
            audit["auto_escalation"] = "Token Reuse Detected"
            
        return {
            "final_decision": decision,
            "audit_trail": audit
        }
