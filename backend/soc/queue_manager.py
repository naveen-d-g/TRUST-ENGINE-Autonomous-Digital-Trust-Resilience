from typing import Dict, Any, List
from backend.enforcement.state.proposal_registry import ProposalRegistry
from backend.threat_model.threat_taxonomy import ThreatSeverity

class QueueManager:
    """
    Manages the SOC Enforcement Queue.
    Prioritizes items based on SOCPriorityScore.
    """
    
    @staticmethod
    def calculate_priority(proposal: Dict[str, Any]) -> float:
        """
        Priority = RiskScore * BlastMultiplier * SeverityMultiplier
        """
        risk = proposal.get("risk_score", 0)
        
        # Get threat assessment from proposal context or lookup
        # (Assuming it's stored in registry via context or separate field)
        # For this stub, we default.
        severity_mult = 1.0
        # If High Severity Threat -> Higher Priority
        
        return risk * severity_mult

    @staticmethod
    def get_prioritized_queue(status_filter: str = "PENDING_APPROVAL") -> List[Dict[str, Any]]:
        proposals = ProposalRegistry.list_proposals(status_filter)
        # Sort by priority desc
        # Note: proposals is a dict {id: prop}
        sorted_props = sorted(
            proposals.values(), 
            key=lambda p: QueueManager.calculate_priority(p), 
            reverse=True
        )
        return sorted_props
