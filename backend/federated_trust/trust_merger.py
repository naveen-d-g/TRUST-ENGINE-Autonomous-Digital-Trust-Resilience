
from typing import List
from backend.federated_trust.models import FederatedSignal

class TrustMerger:
    """
    Merges external signals with internal risk.
    
    INVARIANT:
    - External signals can ONLY increase vigilance (Risk Up).
    - NEVER auto-block based solely on external signal (unless policy allows).
    - NEVER reduce internal risk based on external "clean" signal.
    """
    
    @staticmethod
    def merge_risk(internal_risk: float, external_signals: List[FederatedSignal]) -> float:
        """
        internal_risk: 0-100
        """
        final_risk = internal_risk
        
        valid_signals = [s for s in external_signals if not s.is_expired()]
        
        if not valid_signals:
            return final_risk
            
        # Logic: If we have high confidence external risk, we apply a multiplier or floor.
        # We DO NOT simply add.
        
        max_ext_conf = max((s.confidence for s in valid_signals), default=0.0)
        
        # If external confidence > 0.8, ensure risk is at least MONITOR (30) or RESTRICT (60)
        if max_ext_conf > 0.8:
            final_risk = max(final_risk, 60.0 * 0.8) # Soft floor
            
        # Vigilance Bonus: Add small risk for any valid signal
        final_risk += (len(valid_signals) * 2.0)
        
        return min(100.0, final_risk)
