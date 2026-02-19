
from typing import Dict, Any

class ImpactEstimator:
    """
    Calculates delta between baseline and proposed simulation.
    """
    
    @staticmethod
    def estimate_impact(baseline_stats: Dict[str, int], proposed_stats: Dict[str, int]) -> Dict[str, Any]:
        """
        Returns delta metrics.
        """
        total = baseline_stats.get("total", 1) # Avoid div0
        if total == 0: total = 1
        
        impact = {}
        for outcome in ["ALLOW", "MONITOR", "RESTRICT", "ESCALATE"]:
            base_count = baseline_stats.get(outcome, 0)
            prop_count = proposed_stats.get(outcome, 0)
            
            delta = prop_count - base_count
            pct_change = (delta / total) * 100.0
            
            impact[f"{outcome}_delta_count"] = delta
            impact[f"{outcome}_delta_pct"] = round(pct_change, 2)
            
        # Heuristic for "Improvement"
        # If RESTRICT/ESCALATE decreased without increasing FP?
        # We need labels for true FP/FN. 
        # Without labels, we only measure "Distribution Shift".
        
        return impact
