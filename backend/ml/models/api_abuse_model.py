from typing import Dict, Any
from backend.ml.models.base_model import BaseModel
from backend.ml.schema.feature_schema import FeatureSet

class APIAbuseModel(BaseModel):
    MODEL_NAME = "api_abuse_v1"
    MODEL_VERSION = "1.0.0"
    REQUIRED_FEATURES = [
        "rate_limit_hits", "token_reuse_count", "api_burst_score"
    ]

    def predict(self, features: Dict[str, Any] | FeatureSet) -> float:
        self.validate_features(features)
        score = 0.0
        
        # 1. Rate Limits
        if self._get_val(features, "rate_limit_hits") > 0:
            score += 0.7
            
        # 2. Token Reuse (Critical)
        if self._get_val(features, "token_reuse_count") > 0:
            score += 0.9 # High certainty
            
        # 3. Burstiness
        if self._get_val(features, "api_burst_score") > 0.5:
            score += 0.3
            
        return min(1.0, score)
