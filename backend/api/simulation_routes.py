from flask import Blueprint, request, g, jsonify
from backend.auth.rbac import require
from backend.auth.auth_context import Role, Platform
from backend.utils.response_builder import success_response, error_response
from backend.audit.audit_logger import AuditLogger
import uuid

simulation_bp = Blueprint("simulation", __name__)

@simulation_bp.route("/attack", methods=["POST"])
@require(role=Role.ADMIN.value, platform=Platform.SECURITY.value) # Blocking Rule 5
def simulate_attack():
    """
    Triggers a synthetic attack scenario.
    """
    try:
        data = request.json
        attack_type = data.get("attack_type", "bruteforce")
        target_session = data.get("session_id", str(uuid.uuid4()))
        
        # Audit the Simulation Start
        AuditLogger.log(
            actor=g.user_id,
            action="SIMULATION_STARTED",
            details={"type": attack_type, "target": target_session},
            role=g.role,
            platform=g.platform,
            req_id=g.req_id
        )
        
        # In a real app, this would inject events into the pipeline
        # For now, we return a success signal that the simulation request was accepted
        return success_response({
            "status": "Simulation Triggered",
            "attack_type": attack_type,
            "target_session": target_session
        })
        
    except Exception as e:
        return error_response(str(e), 500)
