from typing import List
from backend.contracts.llm_advice_schema import LLMAdvice
from backend.contracts.signal_types import SignalType

class LLMAdvisor:
    """
    Mock LLM Advisor.
    Returns structured advice based on signals.
    """
    
    @staticmethod
    def generate_advice(risk_score: float, signals: List[SignalType]) -> LLMAdvice:
        """
        Generates security advice.
        In production, this would call GPT-4.
        Here, we use deterministic logic based on signal types.
        """
        
        # Default benign advice
        advice = LLMAdvice(
            threat_summary="No immediate threats detected.",
            recommended_actions=["Continue monitoring standard session behavior."],
            recovery_steps=[],
            confidence=0.95
        )
        
        # High Risk Logic
        if risk_score > 80 or SignalType.ATTACK_DETECTED in signals:
            advice.threat_summary = "High-confidence attack pattern detected."
            advice.recommended_actions = [
                "Terminate session immediately.",
                "Review IP reputation logs.",
                "Enable strict rate limiting for subnet."
            ]
            advice.recovery_steps = [
                "Reset user password.",
                "Verify recent sensitive transactions."
            ]
            advice.confidence = 0.98
            
        elif SignalType.CREDENTIAL_STUFFING in signals:
            advice.threat_summary = "Potential credential stuffing attack."
            advice.recommended_actions = [
                "Trigger CAPTCHA on next login attempt.",
                "Block IP address temporarily."
            ]
            advice.recovery_steps = ["Notify user of suspicious login attempts."]
            advice.confidence = 0.90
            
        elif SignalType.SYSTEM_FAILURE in signals:
            advice.threat_summary = "Infrastructure instability detected."
            advice.recommended_actions = ["Check service health logs.", "Restart failing pod."]
            advice.recovery_steps = ["Run diagnostics."]
            advice.confidence = 0.85

        return advice
