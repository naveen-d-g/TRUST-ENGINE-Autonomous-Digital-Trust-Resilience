
from typing import Dict, Any, Optional
from enum import Enum
from datetime import datetime
import uuid

class ProposalStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    SIMULATING = "SIMULATING" # For async estimation

class PolicyProposal:
    """
    Represents a proposed change to the policy configuration.
    
    INVARIANT:
    - Must NOT be applied without valid approval metadata.
    """
    
    def __init__(
        self,
        change_type: str, # "threshold", "weight", "rule"
        target: str, # "web_abuse_threshold", "api_weight"
        current_value: Any,
        proposed_value: Any,
        proposed_by: str = "system",
        simulation_impact: Optional[Dict] = None
    ):
        self.proposal_id = str(uuid.uuid4())
        self.change_type = change_type
        self.target = target
        self.current_value = current_value
        self.proposed_value = proposed_value
        self.proposed_by = proposed_by
        self.status = ProposalStatus.PENDING
        self.created_at = datetime.utcnow().isoformat()
        
        # Approval Metadata (Review Logic)
        self.approved_by: Optional[str] = None
        self.approval_timestamp: Optional[str] = None
        self.rejection_reason: Optional[str] = None
        
        # Versioning
        self.previous_policy_version: Optional[str] = None
        self.new_policy_version: Optional[str] = None
        
        # Impact Assessment (from Simulator)
        self.simulated_impact = simulation_impact or {}

    def approve(self, user: str, new_version: str):
        """
        Approves the proposal with MANDATORY versioning audit.
        """
        if not user or not new_version:
            raise ValueError("Approval requires 'approved_by' and 'new_policy_version'")
            
        self.status = ProposalStatus.APPROVED
        self.approved_by = user
        self.approval_timestamp = datetime.utcnow().isoformat()
        self.new_policy_version = new_version

    def reject(self, user: str, reason: str):
        self.status = ProposalStatus.REJECTED
        self.approved_by = user # Rejected by
        self.rejection_reason = reason
        self.approval_timestamp = datetime.utcnow().isoformat()

    def to_dict(self) -> Dict:
        return {
            "proposal_id": self.proposal_id,
            "change_type": self.change_type,
            "target": self.target,
            "current_value": self.current_value,
            "proposed_value": self.proposed_value,
            "proposed_by": self.proposed_by,
            "status": self.status.value,
            "created_at": self.created_at,
            "approved_by": self.approved_by,
            "approval_timestamp": self.approval_timestamp,
            "rejection_reason": self.rejection_reason,
            "previous_policy_version": self.previous_policy_version,
            "new_policy_version": self.new_policy_version,
            "simulated_impact": self.simulated_impact
        }
