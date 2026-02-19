from typing import Dict, Any, Optional
from backend.ml.decision.prevention_modes import DecisionType

class PolicyEngine:
    """
    Applies thresholds and manual overrides.
    Returns proposed decision string.
    """
    THRESHOLDS = {
        "ALLOW": 0,
        "MONITOR": 30,
        "RESTRICT": 60,
        "ESCALATE": 80
    }
    
    @staticmethod
    def apply_policy(risk_score: float, context: Dict[str, Any], threshold_overrides: Optional[Dict[str, float]] = None) -> Dict[str, Any]:
        """
        Returns decision and audit trail.
        threshold_overrides: dict for SIMULATION.
        """
        decision = DecisionType.ALLOW
        audit = {
            "override_applied": False,
            "override_by": None,
            "override_reason": None,
            "policy_version": "v2"
        }

        # Use overrides if provided (for simulation/testing)
        thresholds = threshold_overrides or PolicyEngine.THRESHOLDS

        # 1. Check strict thresholds
        if risk_score >= thresholds["ESCALATE"]:
            decision = DecisionType.ESCALATE
        elif risk_score >= thresholds["RESTRICT"]:
            decision = DecisionType.RESTRICT
        elif risk_score >= thresholds["MONITOR"]:
            decision = DecisionType.MONITOR
                
        return {"decision": decision, "audit": audit}
