from flask import Blueprint, request, jsonify
from backend.api.schemas.feedback_schema import FeedbackRequest
from backend.services.feedback_service import FeedbackService

feedback_bp = Blueprint("feedback", __name__)
feedback_service = FeedbackService()

@feedback_bp.route("/feedback", methods=["POST"])
def submit_feedback():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Bad Request", "message": "Missing JSON body"}), 400
            
        # Schema Validation
        try:
            feedback_req = FeedbackRequest.from_dict(data)
        except KeyError as e:
             return jsonify({"error": "Bad Request", "message": f"Missing field: {e}"}), 400
        
        # Service Call (Non-blocking)
        feedback_service.submit(feedback_req.session_id, feedback_req.label, feedback_req.source)
        
        return jsonify({"status": "accepted"}), 202
        
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
