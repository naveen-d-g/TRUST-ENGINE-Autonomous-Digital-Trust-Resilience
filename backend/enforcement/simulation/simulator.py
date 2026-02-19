from typing import Dict, Any

class Simulator:
    """
    Simulates impact of enforcement actions.
    """
    
    @staticmethod
    def simulate(action: str, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Returns predicted impact.
        """
        return {
            "action": action,
            "target_session": context.get("session_id"),
            "predicted_user_impact": "Disruption" if action in ["BLOCK", "ISOLATE"] else "Friction",
            "false_positive_risk": "Low" if context.get("risk_score", 0) > 80 else "Medium",
            "reversible": True
        }
