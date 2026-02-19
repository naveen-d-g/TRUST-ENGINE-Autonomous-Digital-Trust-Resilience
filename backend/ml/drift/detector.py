
from typing import Dict, Any, Optional

class DriftAlert(Exception):
    pass

class DriftDetector:
    """
    Lightweight drift detection for online features.
    
    DRIFT REACTION:
    - Triggers: ALERT operators, FREEZE challenger promotion, FLAG for offline retraining.
    - NEVER Triggers: Auto-retraining, Auto-promotion.
    """
    
    # Baselines loaded from training artifact (Hardcoded for this phase)
    # feature -> (mean, threshold)
    BASELINES = {
        "risk_velocity": (0.0, 0.5), # If mean shifts by > 0.5
        "request_rate_per_min": (10.0, 50.0),
        "failed_login_attempts": (0.5, 2.0)
    }
    
    @staticmethod
    def check_drift(features: Dict[str, Any]) -> Dict[str, Any]:
        """
        Checks for drift on single sample (simplified).
        """
        drift_result = {
            "drift_detected": False,
            "feature": None,
            "severity": "low"
        }
        
        for feat, (train_mean, threshold) in DriftDetector.BASELINES.items():
            val = features.get(feat)
            if val is not None and isinstance(val, (int, float)):
                if abs(val - train_mean) > threshold:
                    drift_result["drift_detected"] = True
                    drift_result["feature"] = feat
                    drift_result["severity"] = "medium"
                    return drift_result
                    
        return drift_result
