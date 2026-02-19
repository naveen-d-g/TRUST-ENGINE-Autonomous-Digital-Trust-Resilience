
from typing import Dict, Any, Optional, List
from backend.trust_intelligence.profile import TrustProfile, TrustProfileScope
from backend.trust_intelligence.score import TrustScoreCalculator
from backend.trust_intelligence.trend import TrendDetector

class TrustIntelligenceEngine:
    """
    Orchestrates Trust Profiles, scoring, and trend detection.
    
    INVARIANT:
    - Advisory Only. Not connected to decision blocking directly.
    """
    
    # In-memory mock storage for now. 
    # In prod, this wraps Redis/Postgres.
    _profiles: Dict[str, TrustProfile] = {}
    
    @classmethod
    def get_profile(cls, entity_id: str, scope: TrustProfileScope = TrustProfileScope.USER) -> TrustProfile:
        if entity_id not in cls._profiles:
            # Create new neutral profile
            cls._profiles[entity_id] = TrustProfile(entity_id, scope)
        return cls._profiles[entity_id]
        
    @classmethod
    def update_trust(cls, entity_id: str, new_risk_score: float, scope: TrustProfileScope = TrustProfileScope.USER):
        """
        Updates the trust profile with a new risk observation.
        new_risk_score: 0.0 to 100.0 from Phase 2 Risk Engine.
        """
        profile = cls.get_profile(entity_id, scope)
        
        # 1. Update History
        # Store tuple (risk, age_days=0.0)
        # In real impl, we'd decay existing ages or store timestamps.
        # For simulation, just append and assume sequence
        profile.history.append({"risk": new_risk_score, "age": 0.0})
        
        # Keep last 50
        if len(profile.history) > 50:
            profile.history = profile.history[-50:]
            
        # 2. Recalculate Score
        # Convert history dicts to tuples for calculator
        risk_tuples = [(item["risk"], item["age"]) for item in profile.history]
        profile.trust_score = TrustScoreCalculator.calculate_score(risk_tuples)
        
        # 3. Recalculate Confidence
        profile.confidence = TrustScoreCalculator.calculate_confidence(len(profile.history))
        
        # 4. Recalculate Trend
        # Need history of *trust scores*? 
        # Or derive trend from risk history? 
        # Typically trend of the TRUST score is what we want.
        # But we only store current trust score. 
        # Let's approximate: Calculate trust score for subsets of history? 
        # Or just store trust history too?
        # Let's derive from risk trend for now (inverse).
        # Actually, let's just use the calculator on the sliding window?
        # No, trend detector expects list of scores.
        # Let's just store the last few trust scores in the profile for trend detection?
        # Simpler: TrendDetector expects list of floats.
        # Let's use the inverse of the risk history as a proxy for "trust moments"?
        # Normalized risks: 1.0 - (risk/100).
        trust_moments = [1.0 - (r/100.0) for r, _ in risk_tuples]
        profile.trend = TrendDetector.detect_trend(trust_moments)
        
        cls._profiles[entity_id] = profile
        return profile

    @classmethod
    def get_trust_advice(cls, entity_id: str) -> Dict[str, Any]:
        """
        Returns advisory metadata for Policy/Confidence engines.
        """
        if entity_id not in cls._profiles:
            return {"trust_level": "NEUTRAL", "confidence": 0.0}
            
        p = cls._profiles[entity_id]
        return {
            "trust_score": p.trust_score,
            "confidence": p.confidence,
            "trend": p.trend.value,
            "is_trusted": p.trust_score > 0.8 and p.confidence > 0.5,
            "is_suspicious": p.trust_score < 0.3 and p.confidence > 0.4
        }
