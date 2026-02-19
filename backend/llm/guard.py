def guarded_fallback(reason: str):
    """
    Deterministic safe fallback for LLM advisory.
    Executed when API keys are missing or failures occur.
    """
    return {
        "risk_summary": f"LLM Guard Active: {reason}",
        "recommended_actions": [
            "Manual SOC review required"
        ],
        "confidence": 0.0,
        "advisory_only": True,
        "reason": reason
    }
