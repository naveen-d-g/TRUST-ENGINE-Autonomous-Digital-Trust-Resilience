from typing import Dict, Any, Optional
from backend.ml.schema.model_contracts import BaseRiskModel

class ModelRegistry:
    """
    Central repository for ML models (Champions/Challengers).
    """
    _champions: Dict[str, BaseRiskModel] = {}
    _challengers: Dict[str, BaseRiskModel] = {}

    @classmethod
    def register_model(cls, domain: str, model: BaseRiskModel, version: str, status: str = "ACTIVE"):
        """
        Registers a model instance. Status can be ACTIVE (Champion) or CHALLENGER.
        """
        if status == "ACTIVE":
            cls._champions[domain] = model
        else:
            cls._challengers[domain] = model

    @classmethod
    def get_model(cls, domain: str, role: str = "champion") -> Optional[BaseRiskModel]:
        """
        Retrieves a model by domain and role.
        """
        if role == "champion":
            return cls._champions.get(domain)
        else:
            return cls._challengers.get(domain)
            
    @classmethod
    def list_models(cls) -> Dict[str, Any]:
        return {
            "champions": {k: v.metadata.version for k, v in cls._champions.items()},
            "challengers": {k: v.metadata.version for k, v in cls._challengers.items()}
        }
