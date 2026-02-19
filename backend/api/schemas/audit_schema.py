from typing import Dict, List, Any
from dataclasses import dataclass

@dataclass
class AuditResponse:
    session_id: str
    session_features: Dict[str, Any]
    decision: str
    explanation: Dict[str, Any]
    model_versions: Dict[str, str]
    policy_version: str
    overrides: List[Any]
    autonomous_actions: List[Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "session_id": self.session_id,
            "session_features": self.session_features,
            "decision": self.decision,
            "explanation": self.explanation,
            "model_versions": self.model_versions,
            "policy_version": self.policy_version,
            "overrides": self.overrides,
            "autonomous_actions": self.autonomous_actions
        }
