from pydantic import BaseModel, Field
from typing import List, Optional

class LLMAdvice(BaseModel):
    """
    Contract for LLM-generated security advice.
    Ensures LLM output is structured and safe to consume.
    """
    threat_summary: str = Field(..., description="Concise summary of the detected threat.")
    recommended_actions: List[str] = Field(..., description="List of immediate actions for the SOC analyst.")
    recovery_steps: List[str] = Field(..., description="Steps to recover the user or system.")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Confidence score of the advice (0.0 to 1.0).")
    context_used: Optional[List[str]] = Field(default=[], description="Key factors used to generate this advice.")
