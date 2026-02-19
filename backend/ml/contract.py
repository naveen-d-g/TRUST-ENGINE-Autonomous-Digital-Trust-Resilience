
from typing import Dict, List, Any
import abc

class FeatureMismatchError(Exception):
    """Raised when provided features do not match the model's contract."""
    pass

class BaseRiskModel(abc.ABC):
    """
    Base contract for all domain-specific security models.
    Enforces training/inference separation, versioning, and feature contracts.
    
    INFERENCE-ONLY CONTRACT:
    - No DB writes
    - No weight updates (stateless)
    - No training data access
    - Deterministic output only
    
    FEATURE FAILURE HANDLING:
    - Includes: missing features, invalid ranges, stale timestamps.
    - Behavior: Proceed with reduced feature set. Apply conservative weighting.
    """
    
    # Must be defined by subclasses
    MODEL_VERSION: str = "0.0.0"
    FEATURE_SCHEMA_VERSION: str = "0.0.0"
    REQUIRED_FEATURES: List[str] = []

    def validate_features(self, features: Dict[str, Any]):
        """
        Validates that the input features match the contract.
        Raises FeatureMismatchError if required features are missing.
        """
        missing = set(self.REQUIRED_FEATURES) - features.keys()
        if missing:
            raise FeatureMismatchError(f"Missing required features for {self.__class__.__name__}: {missing}")

    @abc.abstractmethod
    def predict(self, features: Dict[str, float]) -> float:
        """
        Returns calibrated probability in range [0.0, 1.0].
        Must be stateless and deterministic.
        """
        raise NotImplementedError
