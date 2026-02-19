from typing import List, Dict, Any

class TemporalIntrusionModel:
    """
    Detects high-risk patterns in system event sequences.
    This is where LSTM / HMM logic would live.
    For now, uses heuristic signatures of known attack chains.
    """
    
    # Signatures: List of event types in order
    ATTACK_SIGNATURES = [
        ["FILE_MOD", "PROCESS_SPAWN", "NET_CONNECT"], # Webshell pattern?
        ["AUTH_FAIL", "AUTH_FAIL", "AUTH_FAIL", "ADMIN_LOGIN"], # Brute-force success?
        ["PRIV_ESCALATE", "shadow_file_read"] 
    ]

    @classmethod
    def analyze_sequence(cls, sequence: List[Dict[str, Any]]) -> float:
        """
        Returns a risk score [0.0, 1.0] based on the sequence.
        """
        if not sequence:
            return 0.0
            
        # Extract types
        types = [e["type"] for e in sequence]
        
        # Check against signatures (simple subsequence check)
        # In real ML, this would be `model.predict(sequence)`
        
        risk = 0.0
        
        # 1. Frequency Analysis (e.g. rapid file mods)
        pass # Todo
        
        # 2. Signature Match
        for sig in cls.ATTACK_SIGNATURES:
            if cls._has_subsequence(types, sig):
                risk = max(risk, 0.9) # High confidence
                
        return risk

    @staticmethod
    def _has_subsequence(full: List[str], sub: List[str]) -> bool:
        """Checks if sub appears in full (in order)"""
        # Simple iterator check
        it = iter(full)
        return all(any(c == target for c in it) for target in sub)
