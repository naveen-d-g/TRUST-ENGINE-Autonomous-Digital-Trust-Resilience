import time
import logging
from backend.session.session_snapshot import SessionSnapshot
from backend.ml.guards import enforce_ml_input
from backend.ml.inference_pipeline import evaluate_session as ml_evaluate # Renaming to avoid conflict
from typing import Dict, Any

logger = logging.getLogger(__name__)

class InferenceAdapter:
    """
    Read-Only Bridge to ML.
    Enforces type safety: Only SessionSnapshot allowed.
    Enforces/Monitors Latency Contract (< 200ms).
    """
    
    @staticmethod
    def evaluate_session(snapshot: SessionSnapshot) -> Dict[str, Any]:
        # 1. Type Guard (Blocking Issue 3)
        # 🔴 BLOCKER 2 – Strict Gateway
        enforce_ml_input(snapshot)
            
        # 2. Transform Snapshot -> Model Input (Read-Only)
        model_input = {
            "session_id": str(snapshot.session_id), # Force str
            "features": snapshot.features,
            "events": snapshot.events, # 🔴 Pass raw events for extraction
            "timestamp": snapshot.window_end.isoformat()
        }
        
        # 3. Call ML with Latency Tracking
        # 🔴 BLOCKER 2: 200ms Latency Budget
        start_time = time.perf_counter()
        try:
            inference_result = ml_evaluate(model_input)
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Enforce Contract
            result_dict = inference_result.to_dict()
            
            # Add Latency Metadata
            if "metadata" not in result_dict:
                result_dict["metadata"] = {}
            result_dict["metadata"]["latency_ms"] = round(duration_ms, 2)
            
            if duration_ms > 200:
                logger.warning(f"ML LATENCY VIOLATION: {duration_ms:.2f}ms for session {snapshot.session_id}")
            
            return result_dict
            
        except Exception as e:
            # Fallback for ML failure
            logger.error(f"ML Inference Failure: {e}")
            return {
                "session_id": str(snapshot.session_id),
                "risk_score": 50.0,
                "decision": "ERROR_FALLBACK",
                "explanation": {"primary_cause": "ML_PIPELINE_ERROR", "error": str(e)},
                "model_versions": {},
                "policy_version": "fallback",
                "metadata": {"error": str(e), "latency_ms": 0.0}
            }
