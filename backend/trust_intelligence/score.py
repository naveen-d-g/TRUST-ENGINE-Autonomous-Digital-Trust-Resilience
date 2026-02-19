
import math
from typing import List, Tuple

class TrustScoreCalculator:
    """
    Computes long-term trust score based on risk history.
    """
    
    DECAY_RATE = 0.1 # Exponential decay factor
    OSCILLATION_PENALTY = 0.15 # Penalty for flip-flopping
    
    @staticmethod
    def calculate_score(risk_history: List[Tuple[float, float]]) -> float:
        """
        risk_history: List of (risk_score, age_in_days).
        risk_score: 0.0 to 100.0 (Phase 2 output)
        Returns: Trust Score 0.0 to 1.0
        """
        if not risk_history:
            return 0.5 # Neutral start
            
        weighted_sum = 0.0
        total_weight = 0.0
        
        # 1. Exponential Decay on Risks
        # Recent risks matter more.
        # Trust = 1.0 - (Aggregated Risk / 100.0)
        
        for risk, age in risk_history:
            # weight = e^(-lambda * age)
            weight = math.exp(-TrustScoreCalculator.DECAY_RATE * age)
            weighted_sum += risk * weight
            total_weight += weight
            
        if total_weight == 0:
            return 0.5
            
        avg_risk = weighted_sum / total_weight
        
        # 2. Oscillation Penalty
        # If variance is high, trust is lower.
        # Simplified: Check standard deviation of recent risks?
        # Or Just simple volatility.
        # Let's use standard deviation if we have enough points.
        penalty = 0.0
        if len(risk_history) > 2:
            risks = [r for r, _ in risk_history]
            mean_r = sum(risks) / len(risks)
            variance = sum((r - mean_r) ** 2 for r in risks) / len(risks)
            std_dev = math.sqrt(variance)
            
            # If std_dev is high (e.g. > 20), apply penalty
            # std_dev 20 => penalty 0.15 * (20/100) = 0.03? 
            # Let's map std_dev directly to a specific penalty if > threshold.
            if std_dev > 20.0:
                penalty = TrustScoreCalculator.OSCILLATION_PENALTY
        
        # Trust is inverse of Risk
        base_trust = 1.0 - (avg_risk / 100.0)
        
        final_trust = base_trust - penalty
        return max(0.0, min(1.0, final_trust))

    @staticmethod
    def calculate_confidence(observation_count: int, expected_daily: int = 10) -> float:
        """
        Confidence increases with more data points.
        """
        # Simple saturation function
        # 100 observations to reach ~95% confidence?
        # conf = 1 - e^(-k * count)
        if observation_count == 0:
            return 0.0
            
        return min(1.0, 1.0 - math.exp(-0.05 * observation_count))
