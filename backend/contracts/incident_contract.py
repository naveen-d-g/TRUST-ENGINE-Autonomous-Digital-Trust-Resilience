from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import List
from backend.contracts.enums import IncidentState

class IncidentContract(BaseModel):
    incident_id: str
    title: str
    state: IncidentState
    affected_sessions: List[str]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        extra="forbid",
        frozen=True
    )
