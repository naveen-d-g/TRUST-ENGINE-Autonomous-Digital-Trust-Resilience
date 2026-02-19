
from dataclasses import dataclass
from typing import Any, Dict

@dataclass
class GovernanceInsight:
    insight: str
    evidence: str
    confidence: float
    source_component: str # e.g. "OverrideAnalyzer"
    relevance: str = "HIGH"

    def to_dict(self) -> Dict:
        return {
            "insight": self.insight,
            "evidence": self.evidence,
            "confidence": self.confidence,
            "source": self.source_component,
            "relevance": self.relevance
        }
