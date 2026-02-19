from typing import Dict, Any

def extract_api_features(session: Dict[str, Any]) -> Dict[str, float]:
    """
    Extracts API-related features.
    """
    # Burst score logic: simple heuristic
    api_burst = 1.0 if session.get("rate_limit_hits", 0) > 0 else 0.0
    
    token_reuse = 1 if session.get("token_reuse_detected", False) else 0
    
    # Calculate simple auth failure for API context
    # Usually handled by auth_features, but useful here too if API auth is distinct
    # For now, we'll keep it simple
    
    return {
        "api_burst_score": api_burst,
        "token_reuse_count": token_reuse,
        "auth_failure_ratio": 0.0, # Can differ from global auth failure
        "endpoint_variance": 0.0,
        "rate_limit_hits": session.get("rate_limit_hits", 0)
    }
