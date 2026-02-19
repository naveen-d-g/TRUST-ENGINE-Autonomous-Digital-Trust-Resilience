
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.institutional_memory.models import InstitutionalMemory, MemoryType, MemoryOutcome

class MemoryRecorder:
    """
    Write-only interface for Institutional Memory.
    Ensures append-only behavior.
    """
    
    # In-memory storage for now (Simulating a Time-Series DB or Append-Only Log)
    _memory_store: List[InstitutionalMemory] = []
    
    @classmethod
    def record(cls, memory: InstitutionalMemory):
        """
        Commit a memory to the store.
        """
        # In a real system, this would write to Elastic/TimescaleDB
        cls._memory_store.append(memory)
        print(f"[MEMORY] Recorded {memory.entity_type} for {memory.entity_id}")

    @classmethod
    def record_decision(cls, session_id: str, decision: str, risk_score: float, context_summary: Dict):
        mem = InstitutionalMemory(
            entity_type=MemoryType.DECISION,
            entity_id=session_id,
            context=context_summary,
            outcome=MemoryOutcome.UNKNOWN, # Outcome known later
            confidence=risk_score / 100.0
        )
        cls.record(mem)
        
    @classmethod
    def record_override(cls, session_id: str, original: str, override: str, analyst_id: str):
        mem = InstitutionalMemory(
            entity_type=MemoryType.OVERRIDE,
            entity_id=session_id,
            context={"original": original, "override": override},
            outcome=MemoryOutcome.NEUTRAL,
            created_by=analyst_id
        )
        cls.record(mem)

class MemoryRetriever:
    """
    Read-only interface for Institutional Memory.
    """
    
    @classmethod
    def get_memories(cls, entity_id: Optional[str] = None, memory_type: Optional[MemoryType] = None, limit: int = 100) -> List[InstitutionalMemory]:
        """
        Query the memory store.
        """
        results = MemoryRecorder._memory_store # Access shared store
        
        if entity_id:
            results = [m for m in results if m.entity_id == entity_id]
        
        if memory_type:
            results = [m for m in results if m.entity_type == memory_type]
            
        # Sort by latest
        results.sort(key=lambda x: x.timestamp, reverse=True)
        return results[:limit]
