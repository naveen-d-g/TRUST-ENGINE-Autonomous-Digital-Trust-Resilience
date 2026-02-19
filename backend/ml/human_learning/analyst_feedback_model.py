from typing import Dict, Any

class AnalystFeedbackModel:
    """
    Learns from Analyst decisions (Overrides) to weight confidence 
    in Model Suggestions.
    """
    
    # Model: Feature(Signatures) -> TrustWeight
    # Actually, simpler: Role -> TrustWeight? 
    # Or: "Model X High Confidence" vs "Analyst Rejected" -> Lower confidence next time?
    
    # Let's simple implementation: Track "Agreement Rate" per Model Component
    # Components: "web_abuse", "api_abuse", etc.
    _agreement_stats: Dict[str, Dict[str, int]] = {}

    @classmethod
    def record_feedback(cls, model_component: str, model_decision: str, analyst_decision: str):
        """
        analyst_decision: "CONFIRM" or "OVERRIDE"
        """
        if model_component not in cls._agreement_stats:
            cls._agreement_stats[model_component] = {"agree": 0, "override": 0}
            
        if analyst_decision == "CONFIRM" or model_decision == analyst_decision:
            cls._agreement_stats[model_component]["agree"] += 1
        else:
            cls._agreement_stats[model_component]["override"] += 1

    @classmethod
    def get_trust_weight(cls, model_component: str) -> float:
        """
        Returns a weight [0.0, 1.0] for the model's predictions based on past accuracy.
        """
        s = cls._agreement_stats.get(model_component)
        if not s or (s["agree"] + s["override"] == 0):
            return 1.0 # Trust by default
            
        total = s["agree"] + s["override"]
        return s["agree"] / total
