
from typing import List, Dict
from backend.institutional_memory.storage import MemoryRetriever, MemoryType
import json

class AuditExporter:
    """
    Generates compliance artifacts.
    """
    
    @staticmethod
    def export_decision_history(entity_id: str) -> str:
        """
        Exports full decision history for a user (GDPR Request).
        Returns JSON string.
        """
        memories = MemoryRetriever.get_memories(entity_id=entity_id) # Memory connects loose events
        # Note: In real system, we'd also query AuditLog DB
        
        export_data = {
            "entity": entity_id,
            "generated_at": "now",
            "history": [m.to_dict() for m in memories]
        }
        return json.dumps(export_data, indent=2)

    @staticmethod
    def generate_policy_report() -> str:
        """
        Exports policy changes and override stats.
        """
        # This would query proper tables. Mocking via Memory for phase 4.
        overrides = MemoryRetriever.get_memories(memory_type=MemoryType.OVERRIDE, limit=1000)
        return json.dumps({
            "total_overrides": len(overrides),
            "sample": [m.to_dict() for m in overrides[:5]]
        }, indent=2)
