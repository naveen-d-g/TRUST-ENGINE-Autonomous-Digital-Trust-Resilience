
from typing import List, Tuple
from backend.trust_intelligence.profile import TrustTrend

class TrendDetector:
    """
    Detects direction of trust evolution.
    """
    
    @staticmethod
    def detect_trend(scores: List[float]) -> TrustTrend:
        """
        scores: List of trust scores ordered by time (oldest -> newest).
        """
        if len(scores) < 3:
            return TrustTrend.UNKNOWN
            
        # Simple Linear Regression Slope
        n = len(scores)
        x = range(n)
        y = scores
        
        sum_x = sum(x)
        sum_y = sum(y)
        sum_xy = sum(i * score for i, score in enumerate(y))
        sum_xx = sum(i * i for i in x)
        
        # Slope formula: (n*sum_xy - sum_x*sum_y) / (n*sum_xx - sum_x*sum_x)
        numerator = (n * sum_xy) - (sum_x * sum_y)
        denominator = (n * sum_xx) - (sum_x * sum_x)
        
        if denominator == 0:
            return TrustTrend.STABLE
            
        slope = numerator / denominator
        
        # Thresholds for trend
        if slope > 0.005:
            return TrustTrend.IMPROVING
        elif slope < -0.005:
            return TrustTrend.DEGRADING
        else:
            return TrustTrend.STABLE
