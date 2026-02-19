from flask import Blueprint, jsonify
from backend.services.audit_service import AuditService

audit_bp = Blueprint("audit", __name__)
audit_service = AuditService()

@audit_bp.route("/audit/session/<session_id>", methods=["GET"])
def get_session_audit(session_id):
    try:
        response = audit_service.get_session_audit(session_id)
        return jsonify(response.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
