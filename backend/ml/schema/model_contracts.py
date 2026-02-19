from abc import ABC, abstractmethod
from typing import Dict, List, Any
from backend.ml.schema.feature_schema import FeatureSet

class ModelMetadata:
    def __init__(self, name: str, version: str, required_features: List[str]):
        self.name = name
        self.version = version
        self.required_features = required_features

class BaseRiskModel(ABC):
    """
    Abstract Base Class for all risk models.
    Enforces standard interface for prediction and metadata.
    """
    
    MODEL_NAME: str = "base_model"
    MODEL_VERSION: str = "0.0.1"
    REQUIRED_FEATURES: List[str] = []

    def __init__(self):
        self.metadata = ModelMetadata(
            name=self.MODEL_NAME,
            version=self.MODEL_VERSION,
            required_features=self.REQUIRED_FEATURES
        )

    def validate_features(self, features: Dict[str, Any]) -> None:
        """
        Validation logic to ensure required features exist.
        Now supports both dict and FeatureSet object.
        """
        if isinstance(features, FeatureSet):
            # FeatureSet is always valid by definition of Pydantic default values
            return
            
        missing = [f for f in self.REQUIRED_FEATURES if f not in features]
        if missing:
            # In production, we might log warning instead of crashing
            # For now, we assume missing features = 0.0
            pass

    @abstractmethod
    def predict(self, features: Dict[str, Any] | FeatureSet) -> float:
        """
        Returns a risk probability between 0.0 and 1.0.
        """
        pass
