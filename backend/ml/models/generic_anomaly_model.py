from typing import Dict, Any
from backend.ml.models.base_model import BaseModel
from backend.ml.schema.feature_schema import FeatureSet

class GenericAnomalyModel(BaseModel):
    """
    Safety Net: Unsupervised Anomaly Detection.
    """
    MODEL_NAME = "generic_anomaly_v1"
    MODEL_VERSION = "1.0.0"
    REQUIRED_FEATURES = [] 

    def predict(self, features: Dict[str, Any] | FeatureSet) -> float:
        # Heuristic: If multiple counters are non-zero, assume anomaly
        # In real training, this would map feature vector to distance from centroid
        
        count = 0
        if isinstance(features, FeatureSet):
            # Scan fields via dict dump
            data = features.dict()
        else:
            data = features
            
        # Count non-zero numerical signals
        for k, v in data.items():
            if isinstance(v, (int, float)) and v > 0 and "timestamp" not in k and "session_id" not in k:
               count += 1
               
        if count > 5:
            return 0.4
        return 0.1 # Baseline noise
