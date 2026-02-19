from typing import Dict, Any

class OutcomeFeatureBuilder:
    """
    Extracts and transforms enforcement context into features for the Outcome Model.
    Focuses on:
    - Pre-action risk state
    - Action characteristics
    - Governance context (who approved?)
    """

    @staticmethod
    def build_features(context: Dict[str, Any], action: str, outcome_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Builds a flattened feature vector (dict) for the model.
        
        Args:
            context (dict): The ExecutionContext serialization (risk_score, trust_score, etc.)
            action (str): The enforcement action taken (e.g., "BLOCK_IP", "CAPTCHA")
            outcome_data (dict): Post-action metrics (e.g., {"user_churned": False, "risk_drop": 50})
        
        Returns:
            dict: Feature vector
        """
        features = {}

        # 1. State Context features
        features["risk_score_initial"] = context.get("risk_score", 0.0)
        features["trust_score_initial"] = context.get("trust_score", 100.0)
        features["session_age"] = context.get("session_age", 0.0)
        
        # 2. Action features
        features["action_type"] = action
        # We could encode action severity here if we had the map, 
        # but the model likely learns per-action weights.

        # 3. Governance features
        # If manual approval happened, it's a strong signal of "intended" action
        features["is_auto_executed"] = context.get("is_auto", False) 
        # Note: context might need to be richer to include 'is_auto' if not already present.
        # The 'context' dict from ExecutionContext doesn't have 'is_auto' by default, 
        # it might need to be passed in 'outcome_data' or inferred.
        
        # 4. Outcome signals (Target labels for training, but also used for online scoring if immediate)
        # For inference (prediction), we don't have outcome yet.
        # But this builder is for LEARNING (post-hoc).
        # So we include them? 
        # Actually, the Model takes FEATURES to predict SCORE.
        # If we are Training, we need Labels.
        # If we are Scoring (Ranking), we need Features.
        # This Builder seems to be for PREPARING data for the "Outcome Model" to *learn* from?
        # "Purpose: Learn whether a proposed action was Effective/Neutral/Harmful"
        # So the input to the learning step is (Features + Outcome).
        # The output of the model (later, during inference) is "Predicted Success Score".
        
        # Let's align on "Learning Mode" vs "Inference Mode".
        # The prompt says: "Inputs: Original ML decision, Threat assessment, Enforcement action, Outcome metrics".
        # So this builder prepares the "Training Sample".
        
        features["risk_drop"] = outcome_data.get("risk_drop", 0.0)
        features["false_positive_report"] = outcome_data.get("false_positive", False)
        features["latency_impact"] = outcome_data.get("latency", 0.0)
        
        return features
