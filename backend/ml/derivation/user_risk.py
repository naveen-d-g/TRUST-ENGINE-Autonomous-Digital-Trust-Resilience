
"""
User Risk Derivation (Read-Only)
Version: v1.0

Calculates User Risk based on historical session scores.
Method: Exponential Moving Average (EMA) of last N session scores.
Strictly derived - never predicted directly.
"""
from typing import List

class UserRiskDerivation:
    def __init__(self, ema_alpha: float = 0.3):
        self.alpha = ema_alpha

    def calculate_risk(self, session_scores: List[float]) -> float:
        """
        Calculates user risk score using EMA on session history.
        session_scores: List of float [0.0 - 1.0], ordered oldest to newest.
        """
        if not session_scores:
            return 0.0
            
        ema = session_scores[0]
        for score in session_scores[1:]:
            ema = (self.alpha * score) + ((1 - self.alpha) * ema)
            
        return ema
