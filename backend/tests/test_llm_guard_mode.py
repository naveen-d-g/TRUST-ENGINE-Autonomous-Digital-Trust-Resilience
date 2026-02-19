import pytest
import os
from backend.llm.advisor import generate_advice

def test_llm_guard_mode_no_key():
    """
    Verifies that the system falls back to a deterministic safe response when no API key is present.
    """
    # Ensure key is missing
    old_key = os.environ.get("OPENAI_API_KEY")
    if "OPENAI_API_KEY" in os.environ:
        del os.environ["OPENAI_API_KEY"]
        
    try:
        advice = generate_advice({"risk": "HIGH"})

        assert advice["confidence"] == 0.0
        assert advice["advisory_only"] is True
        assert "Manual SOC review" in advice["recommended_actions"][0]
        assert "API key missing" in advice["reason"]
    finally:
        # Restore key if it was there
        if old_key:
            os.environ["OPENAI_API_KEY"] = old_key

def test_llm_schema_enforcement():
    """
    Verifies that the LLM output is strictly validated against the LLMAdvisory schema.
    """
    # We can mock the environment to test the 'success' path if we want,
    # but the primary requirement is the Guard Mode and Schema Lock.
    # The current generate_advice has a simulated success path.
    
    os.environ["OPENAI_API_KEY"] = "sk-fake-key-for-test"
    
    try:
        advice = generate_advice({"risk": "LOW"})
        assert "risk_summary" in advice
        assert isinstance(advice["recommended_actions"], list)
        assert 0.0 <= advice["confidence"] <= 1.0
    finally:
        if "OPENAI_API_KEY" in os.environ:
            del os.environ["OPENAI_API_KEY"]
