from typing import Dict, Any
from backend.ml.models.base_model import BaseModel
from backend.ml.schema.feature_schema import FeatureSet

class NetworkAttackModel(BaseModel):
    MODEL_NAME = "network_attack_v1"
    MODEL_VERSION = "1.0.0"
    REQUIRED_FEATURES = [
        "lateral_movement_score", "port_scan_count", "unique_ports"
    ]

    def predict(self, features: Dict[str, Any] | FeatureSet) -> float:
        self.validate_features(features)
        score = 0.0
        
        # 1. Lateral Movement (IDS Signal)
        score += self._get_val(features, "lateral_movement_score")
        
        # 2. Port Scanning
        if self._get_val(features, "port_scan_count") > 0:
            score += 0.7
            
        # 3. Unique Ports (Fan out)
        if self._get_val(features, "unique_ports") > 5:
            score += 0.5
            
        return min(1.0, score)
