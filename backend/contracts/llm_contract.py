from pydantic import BaseModel, Field
from typing import List, Literal

class RecommendedAction(BaseModel):
    action_type: Literal["BLOCK_IP", "RESET_SESSION", "REQUIRE_MFA", "LOG_ONLY"] = Field(..., description="Type of action.")
    target: str = Field(..., description="Target entity (IP, SessionID, User).")
    reason: str = Field(..., description="Why this action is recommended.")

class LLMResponseContract(BaseModel):
    """
    Strict Schema for LLM Advisory.
    Rejects any hallucinated structure.
    """
    risk_summary: str = Field(..., description="Concise summary of the risk.")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Confidence in the assessment.")
    recommended_actions: List[RecommendedAction] = Field(default_factory=list, description="List of suggested mitigations.")
    recovery_steps: List[str] = Field(default_factory=list, description="Human-readable recovery steps.")
    
    class Config:
        extra = "forbid" # Reject unknown fields
