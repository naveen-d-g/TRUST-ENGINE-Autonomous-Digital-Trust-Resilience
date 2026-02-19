
from typing import Dict, List, Any

class ExplanationBuilder:
    """
    Regulator-ready explanation generator.
    """
    
    @staticmethod
    def build_report(decision_id: str, decision: str, factors: Dict[str, float], policy_version: str) -> Dict[str, Any]:
        
        # Sort factors by impact
        top_factors = sorted(factors.items(), key=lambda x: x[1], reverse=True)[:3]
        
        return {
            "decision_id": decision_id,
            "decision": decision,
            "top_factors": [f[0] for f in top_factors],
            "factor_weights": {f[0]: f[1] for f in top_factors},
            "policy_version": policy_version,
            "human_readable": f"Decision {decision} driven primarily by {top_factors[0][0] if top_factors else 'None'}."
        }
