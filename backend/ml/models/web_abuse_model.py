from typing import Dict, Any
from backend.ml.models.base_model import BaseModel
from backend.ml.schema.feature_schema import FeatureSet

class WebAbuseModel(BaseModel):
    MODEL_NAME = "web_abuse_v1"
    MODEL_VERSION = "1.0.0"
    REQUIRED_FEATURES = [
        "request_rate_per_min", "path_entropy", "error_rate_4xx"
    ]

    def predict(self, features: Dict[str, Any] | FeatureSet) -> float:
        self.validate_features(features)
        score = 0.0
        
        # Heuristic 1: High RPM (Flood)
        rpm = self._get_val(features, "request_rate_per_min")
        if rpm > 600: score += 0.8  # > 10 req/sec
        elif rpm > 60: score += 0.4
        
        # Heuristic 2: Error Probing (4xx)
        err_4xx = self._get_val(features, "error_rate_4xx")
        if err_4xx > 0.5: score += 0.4
        elif err_4xx > 0.1: score += 0.2
        
        # Heuristic 3: Path Entropy (Random scanning)
        entropy = self._get_val(features, "path_entropy")
        if entropy > 4.0: score += 0.3
        
        return min(1.0, score)
