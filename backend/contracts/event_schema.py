from pydantic import BaseModel, Field, validator
from typing import Dict, Any, Literal, Optional
from datetime import datetime

class EventSchema(BaseModel):
    """
    Strict Event Contract for Ingestion.
    All events entering the system MUST validate against this schema.
    """
    event_id: str = Field(..., description="Unique ID for the event.")
    session_id: str = Field(..., description="Session ID associated with the event.")
    event_type: Literal["web", "api", "auth", "network", "system"] = Field(..., description="Category of the event.")
    timestamp: datetime = Field(..., description="ISO 8601 timestamp of when the event occurred.")
    source: str = Field(..., description="Source system or service emitting the event.")
    payload: Dict[str, Any] = Field(..., description="Raw event data (headers, body, metadata).")
    
    @validator("timestamp", pre=True)
    def parse_timestamp(cls, value):
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                raise ValueError("Invalid timestamp format. Expected ISO 8601.")
        return value

class IngestResponse(BaseModel):
    """
    Standard response format for event ingestion.
    """
    status: Literal["success", "error"]
    message: str
    risk_score: Optional[float] = None
    signals: Optional[list] = None
    incident_id: Optional[str] = None
