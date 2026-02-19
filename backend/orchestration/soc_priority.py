from typing import Dict, Any, List
from datetime import datetime
from backend.enforcement.state.proposal_registry import ProposalRegistry
from backend.ml.decision.prevention_modes import DecisionType
from backend.threat_model.threat_taxonomy import ThreatSeverity

class SOCQueuePriority:
    P0 = 0 # Critical / Escalate (SLA 5m)
    P1 = 1 # High / Restrict (SLA 15m)
    P2 = 2 # Medium / Monitor (SLA 1h)
    P3 = 3 # Low / Log (SLA 24h)
    P4 = 4 # Trivia (No SLA)

class SOCPriorityManager:
    """
    Assigns priority to enforcement proposals based on Decision and Severity.
    """
    
    @staticmethod
    def calculate_priority(decision: str, severity: str) -> int:
        from backend.ml.decision.prevention_modes import DecisionType
        
        if decision == DecisionType.ESCALATE:
            return SOCQueuePriority.P0
            
        if severity == ThreatSeverity.CRITICAL:
            return SOCQueuePriority.P0
            
        if decision == DecisionType.RESTRICT:
            return SOCQueuePriority.P1
            
        if severity == ThreatSeverity.HIGH:
            return SOCQueuePriority.P1
            
        if decision == DecisionType.MONITOR:
            return SOCQueuePriority.P3
            
        return SOCQueuePriority.P4
        
    @staticmethod
    def get_sla_seconds(priority: int) -> int:
        if priority == SOCQueuePriority.P0: return 300
        if priority == SOCQueuePriority.P1: return 900
        if priority == SOCQueuePriority.P2: return 3600
        if priority == SOCQueuePriority.P3: return 86400
        return 0

    @staticmethod
    def get_prioritized_queue(status_filter: str = "PENDING_APPROVAL") -> List[Dict[str, Any]]:
        proposals = ProposalRegistry.list_proposals(status_filter)
        # Sort by priority desc
        # Note: proposals is a dict {id: prop}
        sorted_props = sorted(
            proposals.values(), 
            key=lambda p: SocPriority.calculate_priority(p), 
            reverse=True
        )
        return sorted_props
