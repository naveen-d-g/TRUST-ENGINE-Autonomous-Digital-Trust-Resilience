from pydantic import BaseModel, ConfigDict
from datetime import datetime
from backend.contracts.enums import SignalSeverity

class SignalContract(BaseModel):
    signal_id: str
    event_id: str
    session_id: str
    severity: SignalSeverity
    category: str
    description: str
    timestamp: datetime

    model_config = ConfigDict(
        extra="forbid",
        frozen=True
    )
