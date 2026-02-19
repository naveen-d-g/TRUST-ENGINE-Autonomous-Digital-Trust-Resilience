
from typing import List, Dict
from backend.institutional_memory.models import MemoryType
from backend.institutional_memory.storage import MemoryRetriever
from backend.governance_intelligence.models import GovernanceInsight

class OverrideAnalyzer:
    """
    Analyzes human overrides to find systemic policy failures.
    """
    
    @staticmethod
    def analyze_overrides(window_days: int = 30) -> List[GovernanceInsight]:
        memories = MemoryRetriever.get_memories(memory_type=MemoryType.OVERRIDE, limit=1000)
        
        if not memories:
            return []
            
        # 1. Calculate Override Rate (Mock Logic)
        total = len(memories)
        # e.g. Count overrides where original="ESCALATE" and override="ALLOW"
        escalate_to_allow = sum(1 for m in memories if m.context.get("original") == "ESCALATE" and m.context.get("override") == "ALLOW")
        
        insights = []
        if total > 0:
            rate = escalate_to_allow / total
            if rate > 0.4: # Threshold
                insights.append(GovernanceInsight(
                    insight="Auth threshold potentially too aggressive",
                    evidence=f"{rate:.1%} of ESCALATE actions overridden to ALLOW",
                    confidence=0.85,
                    source_component="OverrideAnalyzer"
                ))
                
        return insights
