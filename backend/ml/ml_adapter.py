from backend.ml.guards import enforce_ml_input

def evaluate_session(snapshot):
    """
    Read-only ML adapter.
    Enforces strict input contract via gateway guards.
    """
    enforce_ml_input(snapshot)

    # Deterministic scoring for SOC-clean logic
    risk_score = 0.42 if snapshot.features.get("event_count", 0) > 0 else 0.0
    
    return {
        "session_id": snapshot.session_id,
        "risk_score": risk_score,
        "label": "SUSPICIOUS" if risk_score > 0.4 else "BENIGN",
        "explanation": "Elevated event frequency detected in session buffer."
    }
