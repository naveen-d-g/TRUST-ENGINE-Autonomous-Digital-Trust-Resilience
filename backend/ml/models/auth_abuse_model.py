from typing import Dict, Any
from backend.ml.models.base_model import BaseModel
from backend.ml.schema.feature_schema import FeatureSet

class AuthAbuseModel(BaseModel):
    MODEL_NAME = "auth_abuse_v1"
    MODEL_VERSION = "1.0.0"
    REQUIRED_FEATURES = [
        "failed_login_attempts", "captcha_failures", "login_velocity"
    ]

    def predict(self, features: Dict[str, Any] | FeatureSet) -> float:
        self.validate_features(features)
        score = 0.0
        
        # 1. Failed Attempts (Brute Force)
        fails = self._get_val(features, "failed_login_attempts")
        if fails > 10: score += 0.9
        elif fails > 3: score += 0.4
        
        # 2. Captcha Failure (Bot)
        if self._get_val(features, "captcha_failures") > 0:
            score += 0.6
            
        # 3. Login Velocity (Credential Stuffing)
        vel = self._get_val(features, "login_velocity")
        if vel > 10: score += 0.8
        
        return min(1.0, score)
