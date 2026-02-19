from typing import Dict, Any, List
from backend.ml.decision.prevention_modes import DecisionType

class DecisionRouter:
    """
    Routes decisions to appropriate downstream handlers.
    """
    
    @staticmethod
    def route_decision(decision: str) -> str:
        """
        Returns the workflow type.
        """
        if decision == DecisionType.ALLOW:
            return "MONITORING_ONLY"
        
        elif decision == DecisionType.MONITOR:
            return "SOC_ALERT"
            
        elif decision == DecisionType.RESTRICT:
            return "ENFORCEMENT_PROPOSAL"
            
        elif decision == DecisionType.ESCALATE:
            return "HIGH_PRIORITY_ENFORCEMENT"
            
        return "UNKNOWN"
    
    @staticmethod
    def get_suggested_workflow(risk_score: float, context: Dict[str, Any]) -> str:
        # Complex routing logic can go here (e.g. auto-approve low risk captchas?)
        # For now, strict mapping.
        pass
