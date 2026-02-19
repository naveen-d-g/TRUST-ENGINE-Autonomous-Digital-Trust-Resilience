from backend.ml.inference_pipeline import evaluate_session
from typing import Dict, Any

def predict_risk(session_context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Bridge to the ML Inference Pipeline.
    
    Args:
        session_context: Aggregated session state from SessionStateEngine.
        
    Returns:
        Dict containing risk_score, label, explanation, etc.
    """
    # Force read-only by copying (optional but good practice)
    context_copy = session_context.copy()
    
    # Call the existing ML pipeline
    # The pipeline expects a dictionary representing the session state.
    result = evaluate_session(context_copy)
    
    # Normalize output if necessary, though evaluate_session returns a rich dict.
    # We ensure specific keys are present for the API layer.
    
    return {
        "session_id": result.get("session_id"),
        "risk_score": result.get("risk_score", 0.0),
        "label": result.get("decision", "UNKNOWN"),
        "explanation": result.get("risk_reasons", []),
        "raw_output": result # Include full output for deep inspection if needed
    }
