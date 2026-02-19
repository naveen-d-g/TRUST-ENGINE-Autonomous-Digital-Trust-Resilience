from typing import List, Dict, Literal, Any
from dataclasses import dataclass, field

DecisionType = Literal["ALLOW", "MONITOR", "RESTRICT", "ESCALATE"]

@dataclass
class InferRequest:
    session_id: str
    events: List[Dict[str, Any]]
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "InferRequest":
        return InferRequest(
            session_id=data["session_id"],
            events=data["events"]
        )

@dataclass
class InferResponse:
    session_id: str
    risk_score: float
    decision: DecisionType
    explanation: Dict[str, Any]
    model_versions: Dict[str, str]
    policy_version: str
    metadata: Dict[str, Any]  # MUST include latency_ms

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
