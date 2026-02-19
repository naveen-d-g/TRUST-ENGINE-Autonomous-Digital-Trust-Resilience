
"""
IP Risk Derivation (Read-Only)
Version: v1.0

Calculates IP Risk based on historical session scores from this IP.
Method: Max of recent session scores (Aggressive).
Strictly derived - never predicted directly.
"""
from typing import List

class IPRiskDerivation:
    def __init__(self):
        pass

    def calculate_risk(self, session_scores: List[float]) -> float:
        """
        Calculates IP risk score using Max logic.
        session_scores: List of float [0.0 - 1.0].
        """
        if not session_scores:
            return 0.0
            
        return max(session_scores)
