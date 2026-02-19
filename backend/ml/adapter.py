from backend.ml.guards import enforce_snapshot

def score_session(snapshot):
    enforce_snapshot(snapshot)
    # Mocking evaluation for pipeline integration
    # return ml_pipeline.evaluate_session(snapshot)
    return {"risk_score": 0.5, "decision": "ALLOW"}

evaluate_session = score_session
