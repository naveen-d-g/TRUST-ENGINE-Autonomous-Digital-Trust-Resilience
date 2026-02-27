from flask import Blueprint, jsonify, request, g
from backend.db.models import Incident
from backend.audit.models import AuditLog
from backend.auth.decorators import require_access
from backend.contracts.enums import Role
from backend.incidents.enums import IncidentStatus, IncidentSeverity
from backend.incidents.incident_manager import IncidentManager
from backend.audit.service import AuditService
from backend.services.observation_service import SessionStateEngine

bp = Blueprint("soc", __name__)

@bp.route("/incidents", methods=["GET"])
@require_access(role=Role.ANALYST) # Note: simplify to single role for now or update decorator
def list_incidents():
    incidents = Incident.query.all()
    return jsonify([
        {
            "id": str(i.id),
            "status": i.status.value,
            "severity": i.severity.value,
            "created_at": i.created_at.isoformat()
        } for i in incidents
    ])

@bp.route("/incidents/<incident_id>", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_incident(incident_id):
    import uuid
    try:
        uuid.UUID(incident_id)
    except ValueError:
        return jsonify({"error": "Invalid incident ID format"}), 400

    incident = Incident.query.filter_by(id=incident_id).first()
    if not incident:
        return jsonify({"error": "Incident not found"}), 404
    return jsonify({
        "id": str(incident.id),
        "status": incident.status.value,
        "severity": incident.severity.value,
        "created_at": incident.created_at.isoformat() if incident.created_at else None,
        "updated_at": incident.updated_at.isoformat() if incident.updated_at else None
    })

@bp.route("/incidents/<incident_id>/contain", methods=["POST"])
@require_access(role=Role.ADMIN)
def contain_incident(incident_id):
    import uuid
    try:
        uuid.UUID(incident_id)
    except ValueError:
        return jsonify({"error": "Invalid incident ID format"}), 400

    success = IncidentManager.transition_state(incident_id, IncidentStatus.CONTAINED)
    if not success:
        return jsonify({"error": "Incident not found"}), 404
        
    AuditService.log(
        actor_id="SOC_SYSTEM",
        role="ADMIN",
        platform="SECURITY_PLATFORM",
        action="INCIDENT_CONTAINED"
    )
    return jsonify({"status": "Incident contained", "incident_id": incident_id}), 200

@bp.route("/incidents/<incident_id>/recover", methods=["POST"])
@require_access(role=Role.ADMIN)
def recover_incident(incident_id):
    import uuid
    try:
        uuid.UUID(incident_id)
    except ValueError:
        return jsonify({"error": "Invalid incident ID format"}), 400

    success = IncidentManager.transition_state(incident_id, IncidentStatus.RECOVERING)
    if not success:
        return jsonify({"error": "Incident not found"}), 404
        
    AuditService.log(
        actor_id="SOC_SYSTEM",
        role="ADMIN",
        platform="SECURITY_PLATFORM",
        action="INCIDENT_RECOVERING"
    )
    return jsonify({"status": "Incident recovery started", "incident_id": incident_id}), 200

@bp.route("/audit", methods=["GET"])
@require_access(role=Role.ANALYST)
def list_audit_logs():
    from backend.audit.models import AuditLog
    logs = AuditLog.query.order_by(AuditLog.timestamp.desc()).limit(100).all()
    return jsonify([
        {
            "action": l.action,
            "actor": l.actor_id,
            "timestamp": l.timestamp.isoformat(),
            "hash": l.entry_hash
        } for l in logs
    ])
@bp.route("/sessions/<session_id>/terminate", methods=["POST"])
@require_access(role=Role.ANALYST)
def terminate_session(session_id):
    from backend.db.models import Session
    session = Session.query.filter_by(session_id=session_id).first()
    if not session:
        return jsonify({"error": "Session not found"}), 404
        
    session.final_decision = "TERMINATE"
    session.trust_score = 0
    from backend.db.models import db
    db.session.commit()
    
    AuditService.log(
        actor_id="SOC_ANALYST",
        role="ANALYST",
        platform="SECURITY_PLATFORM",
        action="SESSION_TERMINATED"
    )
    return jsonify({"status": "Session terminated", "session_id": session_id}), 200

@bp.route("/sessions/<session_id>/logs", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_session_logs(session_id):
    from backend.db.models import Event
    events = Event.query.filter_by(session_id=session_id).order_by(Event.timestamp.asc()).all()
    return jsonify([e.to_dict() for e in events]), 200

@bp.route("/reset_simulation", methods=["POST"])
@require_access(role=Role.ADMIN)
def reset_simulation():
    """
    Recovers the system from a simulated attack.
    - Resolves OPEN incidents
    - Terminates low-trust sessions
    - Clears attacking sessions from tracking
    """
    from backend.db.models import Session, Incident, db
    
    # 1. Resolve active incidents
    open_incidents = Incident.query.filter_by(status=IncidentStatus.OPEN).all()
    for incident in open_incidents:
        incident.status = IncidentStatus.RESOLVED
        
    # 2. Terminate all risk-bearing sessions (Trust < 80)
    malicious_sessions = Session.query.filter(Session.trust_score < 80).all()
    terminated_sids = []
    for session in malicious_sessions:
        session.final_decision = "TERMINATED"
        session.primary_cause = "Terminated (System Reset)"
        terminated_sids.append(session.session_id)
            
    db.session.commit()
    
    # 3. Clear from active tracking
    to_remove = []
    
    # Force evaluation of all memory sessions to find attackers before they are saved to DB
    for sid, state in SessionStateEngine._sessions.items():
        if sid in terminated_sids:
            to_remove.append(sid)
            continue
            
        # Also clean up memory sessions with low provisional trust or specific attack indicators
        risk_history = state.get("risk_history", [])
        if risk_history and len(risk_history) > 0:
            latest_risk = risk_history[-1][1]
            if latest_risk > 50:
                to_remove.append(sid)
                continue
                
        # Proactively check event counts (e.g., scanners)
        if state.get("total_requests", 0) > 20 and not risk_history:
             # Fast brute force or scanner hasn't been scored yet, kill it just in case
             to_remove.append(sid)
                
    for sid in to_remove:
        if sid in SessionStateEngine._sessions:
             del SessionStateEngine._sessions[sid]
             
    # 4. Clear global history to prevent graph artifacts
    SessionStateEngine._global_history.clear()

    AuditService.log(
        actor_id=getattr(g, 'user_id', 'SOC_ADMIN'),
        role="ADMIN",
        platform="SECURITY_PLATFORM",
        action="SYSTEM_RESET"
    )
    
    return jsonify({
        "status": "System Recovered",
        "incidents_resolved": len(open_incidents),
        "sessions_terminated": len(to_remove)
    }), 200
