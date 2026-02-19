from typing import List, Dict, Any
from backend.api.schemas.policy_schema import PolicyProposalResponse
from backend.context import get_current_tenant

class PolicyService:
    def list_proposals(self) -> List[PolicyProposalResponse]:
        """
        Lists pending policy changes.
        """
        # Stub
        return []

    def approve(self, proposal_id: str) -> None:
        tenant = get_current_tenant()
        print(f"[POLICY] Approved {proposal_id} by {tenant}")

    def reject(self, proposal_id: str) -> None:
        tenant = get_current_tenant()
        print(f"[POLICY] Rejected {proposal_id} by {tenant}")
