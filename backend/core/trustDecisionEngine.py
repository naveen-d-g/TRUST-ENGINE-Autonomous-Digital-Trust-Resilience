class TrustDecisionEngine:
    @staticmethod
    def evaluate(features):
        """
        Computes trust score and final decision based on extracted features.
        """
        # Weighted calculation
        # Higher weights for bot and attack signals
        penalty = (
            features.get("bot_probability", 0) * 0.4 +
            features.get("attack_signal", 0) * 0.9 +
            features.get("anomaly_score", 0) * 0.1 +
            features.get("web_abuse", 0) * 0.1 +
            features.get("api_abuse", 0) * 0.1 +
            features.get("network_anomaly", 0) * 0.1
        )
        
        score = max(0, (1 - penalty) * 100)
        
        # Decision Mapping
        if score > 80:
            decision = "ALLOW"
        elif score > 50:
            decision = "ESCALATE"
        else:
            decision = "RESTRICT"
            
        return round(score, 1), decision
