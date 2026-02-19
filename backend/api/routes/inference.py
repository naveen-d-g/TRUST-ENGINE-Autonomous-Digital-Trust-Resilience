from flask import Blueprint, request, jsonify
import traceback
from backend.api.schemas.inference_schema import InferRequest
from backend.services.inference_service import InferenceService

inference_bp = Blueprint("inference", __name__)
inference_service = InferenceService()

@inference_bp.route("/infer", methods=["POST"])
def infer():
    """
    Real-time Inference Endpoint.
    """
    try:
        data = request.get_json()
        if not data:
             return jsonify({"error": "Bad Request", "message": "Missing JSON body"}), 400
        
        # Schema Validation
        try:
            infer_request = InferRequest.from_dict(data)
        except KeyError as e:
            return jsonify({"error": "Bad Request", "message": f"Missing field: {e}"}), 400
            
        # Service Call
        response = inference_service.infer(infer_request.session_id, infer_request.events)
        
        # Serialization
        return jsonify(response.to_dict()), 200
        
    except (KeyError, ValueError) as e:
        return jsonify({"error": "Bad Request", "message": str(e)}), 400

    except Exception as e:
        # Failsafe for route-level crashes
        traceback.print_exc()
        return jsonify({"error": "Internal Server Error", "message": "Inference Failed"}), 500
