from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any

@dataclass
class InferenceResult:
    """
    Single source of truth for all inference outputs.
    Contracts:
    - session_id: input session
    - risk_score: 0.0-100.0
    - decision: MONITOR, ALLOW, RESTRICT, ESCALATE (Uppercase)
    - explanation: Dict with 'primary_cause', 'top_factors'
    - model_versions: Dict of domain -> model_version
    - policy_version: Version of policy engine used
    - metadata: Optional debug info (latency, tenant_id)
    """
    session_id: str
    risk_score: float
    decision: str
    explanation: Dict[str, Any]
    model_versions: Dict[str, str]
    policy_version: str
    metadata: Dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):
        self.decision = self.decision.upper()

    def to_dict(self) -> Dict[str, Any]:

        return {
            "session_id": self.session_id,
            "risk_score": self.risk_score,
            "decision": self.decision,
            "explanation": self.explanation,
            "model_versions": self.model_versions,
            "policy_version": self.policy_version,
            "metadata": self.metadata
        }
