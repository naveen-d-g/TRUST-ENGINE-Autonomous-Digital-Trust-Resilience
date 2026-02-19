from typing import Dict, Any, List

class EnforcementOutcomeModel:
    """
    Learns from enforcement outcomes to score the effectiveness of actions.
    Includes:
    - Online learning (updating weights)
    - scoring (predicting effectiveness for ranking)
    """
    
    # Simple in-memory weights for now (mocking an ML model)
    # Action -> { "success_count": int, "fail_count": int, "fp_count": int }
    _model_state: Dict[str, Dict[str, int]] = {}
    
    @classmethod
    def update(cls, features: Dict[str, Any]):
        """
        Updates the model based on a resolved outcome.
        This is the Learning Step.
        """
        action = features.get("action_type")
        if not action:
            return

        if action not in cls._model_state:
            cls._model_state[action] = {"b": 0, "n": 0, "h": 0} # Beneficial, Neutral, Harmful
            
        # Determine strict outcome category
        risk_drop = features.get("risk_drop", 0.0)
        is_fp = features.get("false_positive_report", False)
        
        if is_fp:
            cls._model_state[action]["h"] += 1 # Harmful
        elif risk_drop > 20.0:
            cls._model_state[action]["b"] += 1 # Beneficial
        else:
            cls._model_state[action]["n"] += 1 # Neutral/Ineffective
            
        print(f"[ML-LEARNING] Updated stats for {action}: {cls._model_state[action]}")

    @classmethod
    def get_effectiveness_score(cls, action: str, context: Dict[str, Any]) -> float:
        """
        Predicts the 'Outcome Score' [-1, +1] for a proposed action.
        Used by SuggestionEngine to rank actions.
        """
        stats = cls._model_state.get(action, {"b": 0, "n": 0, "h": 0})
        total = stats["b"] + stats["n"] + stats["h"]
        
        if total == 0:
            return 0.0 # Neural start
            
        # Formula: (Beneficial - Harmful*5) / Total
        # Harmful (False Positives) are penalized heavily (x5).
        score = (stats["b"] - (stats["h"] * 5)) / total
        
        # Clamp to [-1, 1]
        return max(-1.0, min(1.0, score))
