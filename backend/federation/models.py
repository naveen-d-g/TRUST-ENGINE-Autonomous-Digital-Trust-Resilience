
from dataclasses import dataclass
from typing import Optional

@dataclass
class TrustSignal:
    entity_hash: str # SHA256 of user_id/email
    score: float # Normalized 0.0 - 1.0 (Low Trust -> High Trust)
    confidence: float # 0.0 - 1.0
    source: str # "Partner_A"
    tlp_level: str = "AMBER" # Traffic Light Protocol

    def to_dict(self):
        return {
            "entity_hash": self.entity_hash,
            "score": self.score,
            "confidence": self.confidence,
            "source": self.source,
            "tlp_level": self.tlp_level
        }
