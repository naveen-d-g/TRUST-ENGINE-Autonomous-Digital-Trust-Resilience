from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Dict, Any

from backend.contracts.enums import (
    DomainEnum,
    ActorTypeEnum,
    IngestionSourceEnum,
    EventTypeEnum
)

class EventContract(BaseModel):

    model_config = ConfigDict(
        extra="forbid",          # 🚨 CRITICAL — Reject unknown fields
        strict=True              # 🚨 No type coercion allowed
    )

    event_id: str
    session_id: str
    domain: DomainEnum
    actor_type: ActorTypeEnum
    actor_id: str
    tenant_id: str
    ingestion_source: IngestionSourceEnum
    event_type: EventTypeEnum
    timestamp: datetime
    payload: Dict[str, Any]
