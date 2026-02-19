from typing import Dict, Any
from backend.ml.schema.model_contracts import BaseRiskModel
from backend.ml.schema.feature_schema import FeatureSet

class BaseModel(BaseRiskModel):
    """
    Concrete Base implementation.
    """
    def _get_val(self, features: Dict[str, Any] | FeatureSet, key: str, default=0.0):
        if isinstance(features, FeatureSet):
            return getattr(features, key, default)
        return features.get(key, default)
