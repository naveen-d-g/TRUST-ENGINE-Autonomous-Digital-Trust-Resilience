from pydantic import BaseModel, Field

class LLMAdvisory(BaseModel):
    risk_summary: str
    recommended_actions: list[str]
    confidence: float = Field(ge=0.0, le=1.0)
    advisory_only: bool = True
