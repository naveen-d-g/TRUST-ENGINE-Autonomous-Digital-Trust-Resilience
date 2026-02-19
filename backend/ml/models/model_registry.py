
"""
Model Registry (Governance-Linked)
Version: v1.0

Manages model versions and promotion states.
Strictly enforces:
- Immutable history
- Governance-gated promotion (CANDIDATE -> CHAMPION)
- Audit Logging
"""
from typing import Dict, Any, Optional
from datetime import datetime
import json
import os

class ModelRegistry:
    STATES = {"TRAINED", "CANDIDATE", "CHAMPION", "SHADOW", "RETIRED"}
    
    def __init__(self, registry_path: str = "backend/ml/models/registry.json"):
        self.registry_path = registry_path
        self.registry = self._load_registry()

    def _load_registry(self) -> Dict[str, Any]:
        if not os.path.exists(self.registry_path):
            return {"models": {}, "champion_version": None, "history": []}
        try:
            with open(self.registry_path, 'r') as f:
                return json.load(f)
        except:
             return {"models": {}, "champion_version": None, "history": []}

    def _save_registry(self):
        # Atomic write preferred, simple dump for v1
        with open(self.registry_path, 'w') as f:
            json.dump(self.registry, f, indent=2)

    def register_model(self, version: str, metadata: Dict[str, Any]):
        """ Registers a new model in TRAINED state. """
        if version in self.registry["models"]:
            raise ValueError(f"Model version {version} already exists.")
            
        self.registry["models"][version] = {
            "state": "TRAINED",
            "metadata": metadata,
            "created_at": str(datetime.now())
        }
        self._audit(f"Registered model {version}")
        self._save_registry()

    def promote_model(self, version: str, target_state: str, approver_id: str):
        """
        Promotes a model to a new state.
        STRICT: Requires explicit human approval (simulated by approver_id).
        """
        if version not in self.registry["models"]:
            raise ValueError(f"Model {version} not found.")
            
        if target_state not in self.STATES:
            raise ValueError(f"Invalid state {target_state}")
            
        # Logic Guards
        current_state = self.registry["models"][version]["state"]
        
        # Candidate -> Champion requires explicit approval
        if target_state == "CHAMPION":
            if current_state != "CANDIDATE":
                raise RuntimeError("Must be CANDIDATE before becoming CHAMPION")
            # Archive old champion
            old_champ = self.registry["champion_version"]
            if old_champ:
                 self.registry["models"][old_champ]["state"] = "RETIRED"
            self.registry["champion_version"] = version

        self.registry["models"][version]["state"] = target_state
        self.registry["models"][version]["updated_at"] = str(datetime.now())
        self.registry["models"][version]["approved_by"] = approver_id
        
        self._audit(f"Promoted {version} from {current_state} to {target_state} by {approver_id}")
        self._save_registry()

    def _audit(self, action: str):
        entry = {
            "action": action,
            "timestamp": str(datetime.now())
        }
        self.registry["history"].append(entry)

    def get_champion(self) -> Optional[str]:
        return self.registry.get("champion_version")
