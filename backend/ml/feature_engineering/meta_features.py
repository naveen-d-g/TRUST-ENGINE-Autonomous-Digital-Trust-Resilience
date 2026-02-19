from typing import Dict, Any
import time

def extract_meta_features(session: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts Meta-features (Time, Risk Velocity, History).
    """
    now = time.time()
    created_at = session.get("created_at", now)
    session_age = now - created_at
    
    # Velocity is calculated in SessionStateEngine or Inference Pipeline
    # We just pass it through or re-calc if needed.
    # We will assume it's passed in the main feature assembly or pre-calced in session.
    
    # Retrieving pre-calculated values from session if available
    risk_velocity = session.get("risk_velocity", 0.0) 
    hist_mean = session.get("historical_risk_mean", 0.0)
    current_risk = session.get("current_risk_score", 0.0)
    
    return {
        "session_age": session_age,
        "risk_velocity": risk_velocity,
        "active_threat_count": 0,
        "previous_decision_weight": 0.0,
        "historical_risk_mean": hist_mean,
        "current_risk_score": current_risk
    }
