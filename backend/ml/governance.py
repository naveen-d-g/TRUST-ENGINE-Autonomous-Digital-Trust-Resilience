from enum import Enum

class ModelStatus(Enum):
    """
    Lifecycle status for ML models.
    Governance Rules:
    - UNTRAINED: Can infer (stub) but cannot be promoted.
    - TRAINING: Currently in training pipeline.
    - ACTIVE: Production-ready. Only ACTIVE models can be Champion.
    - DEPRECATED: Old versions kept for rollback.
    """
    UNTRAINED = "untrained"
    TRAINING = "training"
    ACTIVE = "active"
    DEPRECATED = "deprecated"

    @property
    def can_be_promoted(self) -> bool:
        """Only ACTIVE models can be promoted to Champion."""
        return self == ModelStatus.ACTIVE

    @property
    def can_infer(self) -> bool:
        """UNTRAINED (Stub) and ACTIVE models can infer."""
        return self in {ModelStatus.ACTIVE, ModelStatus.UNTRAINED}
