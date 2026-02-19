import os
from backend.llm.contract import LLMAdvisory
from backend.llm.guard import guarded_fallback

def generate_advice(context: dict) -> dict:
    """
    Generates security advice with schema enforcement and guard fallbacks.
    """
    # 1. API Key Check (Guard Mode)
    if not os.getenv("OPENAI_API_KEY"):
        return guarded_fallback("API key missing")

    # 2. Logic Execution (Placeholder for actual API call)
    try:
        # In a real scenario, this would call an LLM API.
        # Here we enforce the contract even on mocks.
        raw = {
            "risk_summary": "Simulated analysis based on input risk.",
            "recommended_actions": ["Investigate trace", "Rotate tokens"],
            "confidence": 0.85,
            "advisory_only": True
        }
        
        return LLMAdvisory.model_validate(raw).model_dump()
        
    except Exception as e:
        return guarded_fallback(f"LLM Processing Error: {str(e)}")
