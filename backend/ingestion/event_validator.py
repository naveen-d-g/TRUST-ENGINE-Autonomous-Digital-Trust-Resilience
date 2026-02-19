from backend.contracts.event_contract import EventContract
from pydantic import ValidationError
from typing import Dict, Any

class EventValidator:
    """
    Ingestion Barrier.
    Ensures no malformed data enters the system.
    """
    @staticmethod
    def validate(raw_data: Dict[str, Any]) -> EventContract:
        try:
            # 1. Strict Schema Validation
            event = EventContract(**raw_data)
            
            # 2. Hash Verification (if provided)
            # functionality is built into the contract validator now
            
            return event
        except ValidationError as e:
            raise ValueError(f"Schema Violation: {e.errors()}")
        except Exception as e:
            raise ValueError(f"Invalid Event Data: {str(e)}")
