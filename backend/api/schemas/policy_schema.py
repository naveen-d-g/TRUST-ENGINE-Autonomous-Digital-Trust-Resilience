from typing import Dict, Literal, Any
from dataclasses import dataclass

ProposalStatus = Literal["PENDING", "APPROVED", "REJECTED"]

@dataclass
class PolicyProposalResponse:
    proposal_id: str
    change: str
    status: ProposalStatus
    expected_impact: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return {
            "proposal_id": self.proposal_id,
            "change": self.change,
            "status": self.status,
            "expected_impact": self.expected_impact
        }
