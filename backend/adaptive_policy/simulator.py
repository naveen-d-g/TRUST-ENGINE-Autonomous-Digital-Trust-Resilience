
from typing import List, Dict, Any

class Simulator:
    """
    Replays historical data against proposed policy config.
    """
    
    @staticmethod
    def run_simulation(
        historical_features: List[Dict[str, Any]], 
        new_thresholds: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Returns stats on decisions under new policy.
        """
        # LAZY IMPORT to avoid circular dependency with inference_pipeline
        from backend.ml.inference_pipeline import PolicyEngine

        stats = {
            "ALLOW": 0,
            "MONITOR": 0,
            "RESTRICT": 0,
            "ESCALATE": 0,
            "total": 0
        }
        
        for sample in historical_features:
            # We assume sample has 'risk_score' and context from history.
            # If historical_features are SessionFeature objects, we need to extract risk.
            # Assuming sample is dict with 'risk_score' pre-computed (or we re-compute risk if weights changed).
            # For Phase 3 scope: "Apply hypothetical policy change" (Thresholds).
            # So we reuse stored risk_score.
            
            risk = sample.get("risk_score", 0.0)
            context = sample.get("context", {}) # e.g. manual overrides
            
            result = PolicyEngine.apply_policy(risk, context, threshold_overrides=new_thresholds)
            decision = result["decision"]
            
            stats[decision] = stats.get(decision, 0) + 1
            stats["total"] += 1
            
        return stats
