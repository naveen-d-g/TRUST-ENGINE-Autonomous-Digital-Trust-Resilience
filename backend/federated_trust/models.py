
from dataclasses import dataclass
from typing import Optional
import datetime

@dataclass
class FederatedSignal:
    signal_id: str
    source_org: str # Org Hash
    entity_fingerprint: str # SHA256 of ID
    risk_indicator: str # e.g. "credential_stuffing"
    confidence: float # 0.0 - 1.0
    ttl_seconds: int = 86400 # 24h default
    created_at: float = 0.0 # timestamp

    def is_expired(self) -> bool:
        import time
        return (time.time() - self.created_at) > self.ttl_seconds

    def to_dict(self):
        return {
            "signal_id": self.signal_id,
            "source_org": self.source_org,
            "entity_fingerprint": self.entity_fingerprint,
            "risk_indicator": self.risk_indicator,
            "confidence": self.confidence,
            "ttl": self.ttl_seconds
        }
