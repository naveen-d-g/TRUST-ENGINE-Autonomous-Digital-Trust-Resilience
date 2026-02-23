
import time
from flask import Blueprint, request, jsonify, g
from backend.utils.validators import validate_evaluation_request, validate_batch_request
from backend.services.inference_service import InferenceService
from backend.utils.logger import log_decision, log_error
import pandas as pd
import io
from backend.auth.decorators import require_access
from backend.contracts.enums import Role

trust_bp = Blueprint('trust', __name__)

@trust_bp.route("/evaluate", methods=["POST"])
@require_access(role=Role.ANALYST)
def evaluate_session():
    start_time = time.time()
    data = request.get_json(silent=True)
    
    # 1. Validation
    is_valid, error_msg = validate_evaluation_request(data)
    if not is_valid:
        return jsonify(error="Validation Error", message=error_msg), 400
        
    try:
        # 2. Inference
        result = InferenceService.evaluate_session(data)
        
        # 3. Logging (Structured JSON)
        resp_time = int((time.time() - start_time) * 1000)
        log_decision(
            session_id=data["session_id"],
            trust_score=result["trust_score"],
            final_decision=result["final_decision"],
            primary_cause=result["primary_cause"],
            recommended_action=result["recommended_action"],
            endpoint="/evaluate",
            response_time_ms=resp_time
        )
        
        return jsonify(result)
        
    except Exception as e:
        log_error("Inference Failure", endpoint="/evaluate", session_id=data.get("session_id"), error=e)
        return jsonify(error="Inference Error", message=str(e)), 500

@trust_bp.route("/batch", methods=["POST"])
@require_access(role=Role.ANALYST)
def batch_evaluate():
    start_time = time.time()
    
    # 1. Validation
    is_valid, error_msg = validate_batch_request(request.files)
    if not is_valid:
        return jsonify(error="Validation Error", message=error_msg), 400
    
    file = request.files['file']
    
    try:
        df = pd.read_csv(file)
        
        # Validate required columns if necessary (e.g. check for features)
        # For simplicity, we assume columns match feature names or we use defaults
        
        results = []
        for i, row in df.iterrows():
            row_dict = row.to_dict()
            # Ensure session_id has BATCH- prefix for identification
            raw_sid = str(row_dict.get("session_id", f"{int(time.time())}_{i}"))
            session_id = f"BATCH-{raw_sid}" if not raw_sid.startswith("BATCH-") else raw_sid

            payload = {
                "features": row_dict,
                "session_id": session_id,
                "user_id": row_dict.get("user_id", "BATCH_SYSTEM")
            }
            eval_res = InferenceService.evaluate_session(payload)
            results.append(eval_res)
        
        results_df = pd.DataFrame(results)
        
        summary = {
            "decision_distribution": results_df["final_decision"].value_counts().to_dict(),
            "average_trust_score": float(results_df["trust_score"].mean()),
        }
        
        resp_time = int((time.time() - start_time) * 1000)
        
        # Log batch completion
        log_decision(
            session_id="BATCH_PROCESS",
            trust_score=summary["average_trust_score"],
            final_decision="COMPLETED",
            primary_cause=f"Processed {len(df)} rows",
            recommended_action="N/A",
            endpoint="/batch",
            response_time_ms=resp_time
        )
        
        return jsonify({
            "total_records": len(df),
            "processed_records": len(results_df),
            "summary_stats": summary,
            "results": results,
            "status": "completed"
        })
    except Exception as e:
        log_error("Batch Inference Failure", endpoint="/batch", error=e)
        return jsonify(error="Batch Processing Error", message=str(e)), 500
