from backend.contracts.signal_contract import SignalContract, SignalType
from backend.signals.signal_severity import SignalSeverity
from backend.db.models import Signal
from backend.extensions import db
from datetime import datetime
import uuid

class SignalClassifier:
    """
    Maps ML/Rule outputs to Standard Signals.
    Enforces Severity Rules.
    """
    
    @staticmethod
    def classify_and_store(session_id: str, risk_score: float, ml_label: str, metadata: dict) -> SignalContract:
        # 1. Determine Type & Severity
        sig_type = SignalClassifier._map_type(ml_label)
        severity = SignalClassifier._calculate_severity(risk_score, sig_type)
        
        # 2. Persist
        signal_id = str(uuid.uuid4())
        db_signal = Signal(
            signal_id=signal_id,
            session_id=session_id,
            signal_type=sig_type.value,
            severity=severity.value,
            risk_score=risk_score,
            timestamp=datetime.utcnow(),
            signal_metadata=metadata
        )
        db.session.add(db_signal)
        db.session.commit()
        
        return SignalContract(
            signal_id=signal_id,
            session_id=session_id,
            signal_type=sig_type,
            severity=severity,
            risk_score=risk_score,
            timestamp=db_signal.timestamp,
            metadata=metadata
        )

    @staticmethod
    def _map_type(label: str) -> SignalType:
        label = label.upper()
        if "SQL" in label or "XSS" in label: return SignalType.ATTACK_WEB
        if "BRUTE" in label: return SignalType.AUTH_ABUSE
        if "DOS" in label: return SignalType.ATTACK_NETWORK
        return SignalType.ANOMALY_BEHAVIOR

    @staticmethod
    def _calculate_severity(score: float, sig_type: SignalType) -> SignalSeverity:
        if score > 90: return SignalSeverity.CRITICAL
        if score > 75: return SignalSeverity.HIGH
        if score > 50: return SignalSeverity.MEDIUM
        if sig_type in [SignalType.ATTACK_WEB, SignalType.AUTH_ABUSE] and score > 40:
            return SignalSeverity.MEDIUM
        return SignalSeverity.LOW
