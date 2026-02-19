from backend.ml.guards import enforce_ml_input
from backend.session.snapshot import SessionSnapshot

def evaluate_session(snapshot: SessionSnapshot):
    enforce_ml_input(snapshot)

    # Placeholder ML logic (real model already exists)
    return {
        "session_id": str(snapshot.session_id),
        "risk_score": 0.42,
        "label": "BENIGN",
        "explanation": "Normal session behavior"
    }
