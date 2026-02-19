from typing import List, Dict, Any
from backend.contracts.signal_types import SignalType

class SignalService:
    """
    Detects signals based on ML output and event context.
    """
    
    @staticmethod
    def detect_signals(ml_result: Dict[str, Any], event_type: str) -> List[SignalType]:
        """
        Analyzes ML results and returns a list of standardized SignalType enums.
        """
        signals: List[SignalType] = []
        
        # 1. Parse ML Risk Score
        risk_score = ml_result.get("risk_score", 0.0)
        label = ml_result.get("label", "UNKNOWN").upper()
        
        # 2. Risk-based Signals
        if risk_score > 80:
            signals.append(SignalType.ATTACK_DETECTED)
        elif risk_score > 60:
             signals.append(SignalType.RECOVERY_REQUIRED)
        elif risk_score > 40:
             signals.append(SignalType.WARNING)
             
        # 3. Label-based Signals
        if "BOT" in label or "AUTH" in label:
             signals.append(SignalType.CREDENTIAL_STUFFING)
        if "BRUTE" in label:
             signals.append(SignalType.BRUTE_FORCE)
        
        # 4. Context-based Signals (simple heuristics)
        # In a real system, we'd check previous signals or velocity here
        if event_type == "system":
             # Example: Check payload for error codes
             pass
             
        return signals
