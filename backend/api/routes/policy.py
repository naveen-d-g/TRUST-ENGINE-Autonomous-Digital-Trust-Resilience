from flask import Blueprint, request, jsonify
from backend.services.policy_service import PolicyService

policy_bp = Blueprint("policy", __name__)
policy_service = PolicyService()

@policy_bp.route("/policy/proposals", methods=["GET"])
def list_proposals():
    try:
        # Service Call
        proposals = policy_service.list_proposals()
        # Serialization
        return jsonify([p.to_dict() for p in proposals]), 200
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@policy_bp.route("/policy/<proposal_id>/approve", methods=["POST"])
def approve_proposal(proposal_id):
    try:
        policy_service.approve(proposal_id)
        return jsonify({"status": "approved", "proposal_id": proposal_id}), 200
    except Exception as e:
       return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@policy_bp.route("/policy/<proposal_id>/reject", methods=["POST"])
def reject_proposal(proposal_id):
    try:
        policy_service.reject(proposal_id)
        return jsonify({"status": "rejected", "proposal_id": proposal_id}), 200
    except Exception as e:
       return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
