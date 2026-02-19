
from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional
import uuid
import json

class MemoryType(str, Enum):
    DECISION = "DECISION"
    OVERRIDE = "OVERRIDE"
    AUTONOMOUS_ACTION = "AUTONOMOUS_ACTION"
    POLICY_PROPOSAL = "POLICY_PROPOSAL"
    INCIDENT = "INCIDENT"

class MemoryOutcome(str, Enum):
    POSITIVE = "POSITIVE"
    NEGATIVE = "NEGATIVE"
    NEUTRAL = "NEUTRAL"
    UNKNOWN = "UNKNOWN"

class InstitutionalMemory:
    """
    Represents a single unit of institutional knowledge.
    
    INVARIANT:
    - Immutable once written.
    - Append-only.
    """
    
    def __init__(
        self,
        entity_type: MemoryType,
        entity_id: str,
        context: Dict[str, Any],
        outcome: MemoryOutcome = MemoryOutcome.UNKNOWN,
        confidence: float = 0.0,
        created_by: str = "system"
    ):
        self.memory_id = str(uuid.uuid4())
        self.entity_type = entity_type
        self.entity_id = entity_id
        # Context should be summary/key-features, not full raw data dump
        self.context = context 
        self.outcome = outcome
        self.confidence = confidence
        self.created_by = created_by
        self.timestamp = datetime.utcnow().isoformat()
        
    def to_dict(self) -> Dict:
        return {
            "memory_id": self.memory_id,
            "entity_type": self.entity_type.value,
            "entity_id": self.entity_id,
            "context": self.context,
            "outcome": self.outcome.value,
            "confidence": self.confidence,
            "created_by": self.created_by,
            "timestamp": self.timestamp
        }
