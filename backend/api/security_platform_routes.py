from flask import Blueprint, request, jsonify
from backend.middleware.platform_guard import PlatformGuard
from backend.enforcement.state.proposal_registry import ProposalRegistry, ProposalState
from backend.enforcement.simulation.simulator import Simulator
from backend.enforcement.enforcement_actions import EnforcementActions
from backend.enforcement.approval_workflow import ApprovalWorkflow
from backend.audit.audit_log import AuditLogger

security_bp = Blueprint('security_platform', __name__, url_prefix='/platform/security')

@security_bp.route('/enforcement/proposals', methods=['GET'])
@PlatformGuard.require_platform(PlatformGuard.PLATFORM_SECURITY)
def list_proposals():
    status = request.args.get("status", ProposalState.PENDING)
    return jsonify(ProposalRegistry.list_proposals(status)), 200

@security_bp.route('/enforcement/simulate', methods=['POST'])
@PlatformGuard.require_platform(PlatformGuard.PLATFORM_SECURITY)
def simulate_action():
    data = request.json
    action = data.get("action")
    context = data.get("context", {}) # Should essentially be session_id etc
    
    result = Simulator.simulate(action, context)
    return jsonify(result), 200

@security_bp.route('/enforcement/approve', methods=['POST'])
@PlatformGuard.require_platform(PlatformGuard.PLATFORM_SECURITY)
def approve_proposal():
    data = request.json
    proposal_id = data.get("proposal_id")
    approver_role = data.get("role", "analyst") # In real app, from JWT
    
    proposal = ProposalRegistry.get_proposal(proposal_id)
    if not proposal:
        return jsonify({"error": "NotFound"}), 404
        
    # Check Workflow
    if not ApprovalWorkflow.validate_approval(proposal, approver_role):
        return jsonify({"error": "InsufficientRights"}), 403
        
    if ApprovalWorkflow.is_expired(proposal):
        return jsonify({"error": "Expired"}), 400
        
    # Execute
    action = proposal["suggested_action"]
    success = EnforcementActions.execute_action(action, proposal["context"])
    
    if success:
        ProposalRegistry.update_status(proposal_id, ProposalState.APPROVED) # Or EXECUTED
        AuditLogger.log_enforcement(proposal_id, action, "EXECUTED", f"MANUAL_APPROVAL_BY_{approver_role}")
        return jsonify({"status": "executed"}), 200
    else:
        return jsonify({"status": "failed"}), 500
