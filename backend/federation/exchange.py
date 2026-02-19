
from typing import List, Dict
from backend.federation.models import TrustSignal
from backend.federation.privacy import PrivacyGuard

class TrustExchange:
    """
    Handles import/export of trust signals.
    """
    
    @staticmethod
    def export_signal(user_id: str, trust_score: float, confidence: float) -> TrustSignal:
        """
        Exports internal trust score to federated format.
        Internal 0-100 (Risk-inverse) -> External 0.0-1.0
        """
        entity_hash = PrivacyGuard.anonymize(user_id)
        norm_score = max(0.0, min(1.0, trust_score / 100.0))
        
        return TrustSignal(
            entity_hash=entity_hash,
            score=norm_score,
            confidence=confidence,
            source="Internal_Platform"
        )
        
    @staticmethod
    def normalize_incoming(signal: Dict) -> float:
        """
        converts external 0.0-1.0 to internal 0-100.
        """
        # Mapping logic could be complex (e.g. alignment of risk definitions)
        # Here we assume direct linear mapping.
        return signal.get("score", 0.5) * 100.0
