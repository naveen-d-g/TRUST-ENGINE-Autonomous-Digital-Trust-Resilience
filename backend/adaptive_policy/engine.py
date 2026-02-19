
from typing import List, Dict, Any, Optional
from backend.adaptive_policy.proposal import PolicyProposal, ProposalStatus
from backend.adaptive_policy.simulator import Simulator
from backend.adaptive_policy.estimator import ImpactEstimator

class AdaptivePolicyEngine:
    """
    Orchestrates simulation and proposal generation.
    """
    
    _proposals: List[PolicyProposal] = []
    
    @classmethod
    def create_proposal(
        cls, 
        current_thresholds: Dict[str, float],
        proposed_thresholds: Dict[str, float],
        historical_features: List[Dict[str, Any]],
        proposed_by: str = "system"
    ) -> Optional[PolicyProposal]:
        """
        Simulates impact and creates a proposal if beneficial.
        """
        # 1. Rejection Feedback Check (Constraint)
        # Check if similar proposal was recently rejected.
        for p in cls._proposals:
            if (p.status == ProposalStatus.REJECTED and 
                p.target == "thresholds" and 
                p.proposed_value == proposed_thresholds):
                # Simple check: identical thresholds rejected?
                # In prod, check timestamps/similarity.
                print("Suppressing proposal: previously rejected.")
                return None
        
        # 2. Run Simulation
        baseline_stats = Simulator.run_simulation(historical_features, current_thresholds)
        proposed_stats = Simulator.run_simulation(historical_features, proposed_thresholds)
        
        # 3. Estimate Impact
        impact = ImpactEstimator.estimate_impact(baseline_stats, proposed_stats)
        
        # 4. Generate Proposal
        proposal = PolicyProposal(
            change_type="threshold",
            target="global_thresholds",
            current_value=current_thresholds,
            proposed_value=proposed_thresholds,
            proposed_by=proposed_by,
            simulation_impact=impact
        )
        
        cls._proposals.append(proposal)
        return proposal

    @classmethod
    def get_pending_proposals(cls) -> List[PolicyProposal]:
        return [p for p in cls._proposals if p.status == ProposalStatus.PENDING]
        
    @classmethod
    def approve_proposal(cls, proposal_id: str, user: str, new_version: str):
        for p in cls._proposals:
            if p.proposal_id == proposal_id:
                p.approve(user, new_version)
                return True
        return False
        
    @classmethod
    def reject_proposal(cls, proposal_id: str, user: str, reason: str):
        for p in cls._proposals:
            if p.proposal_id == proposal_id:
                p.reject(user, reason)
                return True
        return False
