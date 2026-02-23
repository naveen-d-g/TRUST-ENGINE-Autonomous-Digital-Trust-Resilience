from flask import Blueprint, request, jsonify, g
from backend.auth.rbac import require_role
from backend.db.models import Session
from backend.extensions import db, socketio
from backend.audit.audit_logger import AuditLogger
import requests
import time
import logging

enforcement_bp = Blueprint('enforcement', __name__)
logger = logging.getLogger(__name__)

TARGET_APP_WEBHOOK = "http://localhost:3001/api/terminate"

@enforcement_bp.route('/terminate_session', methods=['POST'])
@require_role(['ADMIN', 'ANALYST'])
def terminate_session():
    """
    Enforcement API: Terminate a session.
    - Requires ADMIN or ANALYST
    - Checks DB session status
    - Notifies Target App
    - Logs to Audit Chain
    - Broadcasts over WebSocket
    """
    data = request.json or {}
    session_id = data.get("session_id")
    
    if not session_id:
        return jsonify({"error": "session_id required"}), 400
        
    # Prevent self-termination abuse if g.user_id matches?
    # Usually session_id is a unique uuid, not user_id.
        
    session_record = Session.query.filter_by(session_id=session_id).first()
        
    # Idempotency check
    if session_record and session_record.final_decision == "TERMINATED":
        return jsonify({
            "status": "idempotent",
            "message": "Session already terminated."
        }), 200

    # 1. Mark DB Status if exists
    if session_record:
        session_record.final_decision = "TERMINATED"
        db.session.commit()
    else:
        # Check memory-only sessions
        from backend.services.observation_service import SessionStateEngine
        if session_id in SessionStateEngine._sessions:
            SessionStateEngine._sessions[session_id]["final_decision"] = "TERMINATED"
            logger.info(f"Marked memory session {session_id} as TERMINATED")
        else:
            logger.warning(f"Session {session_id} not found in DB or Memory, attempting termination webhook anyway.")
    
    # 2. Add to Audit Chain
    AuditLogger.log(
        actor_id=g.user_id,
        action="SESSION_TERMINATED",
        details={"session_id": session_id, "reason": "Manual SOC enforcement"},
        role=getattr(g, 'role', 'system'),
        platform="SECURITY_PLATFORM",
        req_id=getattr(g, 'req_id', 'unknown')
    )
    
    # 3. Emit WebSocket Domain isolation
    socketio.emit(
        "termination_event",
        {"session_id": session_id, "status": "TERMINATED", "actor": g.user_id},
        namespace="/"
    )
    
    # 4. Resilience: Webhook to Target App
    webhook_status = "pending"
    try:
        # Circuit breaker / Timeout
        resp = requests.post(
            TARGET_APP_WEBHOOK,
            json={"session_id": session_id},
            timeout=3.0
        )
        if resp.status_code == 200:
            webhook_status = "success"
        else:
            webhook_status = f"failed_with_{resp.status_code}"
            logger.warning(f"Target app web hook failed: {resp.text}")
    except requests.exceptions.RequestException as e:
        webhook_status = "unreachable"
        logger.error(f"Target App unreachable for termination webhook: {e}")
        
    return jsonify({
        "status": "success",
        "session_id": session_id,
        "webhook_status": webhook_status,
        "message": "Enforcement executed."
    }), 200

@enforcement_bp.route('/users/<user_id>/terminate', methods=['POST'])
@require_role(['ADMIN'])
def terminate_user(user_id):
    """
    Enforcement API: Terminate ALL active sessions for a user (Kill-Switch).
    - Requires ADMIN
    - Finds all ACTIVE sessions in DB for this user
    - Marks them TERMINATED
    - Notifies Target App for EACH session
    - Broadcasrs over WebSocket
    """
    if not user_id:
        return jsonify({"error": "user_id required"}), 400
        
    session_records = Session.query.filter_by(user_id=user_id).filter(Session.final_decision != "TERMINATED").all()
    
    # Target App sessions are memory-only, look them up in SessionStateEngine
    from backend.services.observation_service import SessionStateEngine
    memory_sids = []
    for sid, state in SessionStateEngine._sessions.items():
        events = state.get("events", [])
        if events:
            latest = events[-1]
            if getattr(latest, 'actor_id', None) == user_id or latest.raw_features.get('actor_id') == user_id:
                memory_sids.append(sid)
                
    # NEW: Accept explicit target sessions from the UI Tracker
    ui_targeted_sids = request.json.get("sessions", []) if request.is_json else []
            
    if not session_records and not memory_sids and not ui_targeted_sids:
        return jsonify({
            "status": "idempotent",
            "message": "No active sessions found for user."
        }), 200

    terminated_count = 0
    failed_webhooks = 0
    
    # Collect all SIDs to terminate
    sids_to_terminate = set([s.session_id for s in session_records] + memory_sids + ui_targeted_sids)
    
    for session_record in session_records:
        session_record.final_decision = "TERMINATED"
        
    for sid in sids_to_terminate:
        socketio.emit(
            "termination_event",
            {"session_id": sid, "status": "TERMINATED", "actor": getattr(g, 'user_id', 'system')},
            namespace="/"
        )
        
        try:
            resp = requests.post(
                TARGET_APP_WEBHOOK,
                json={"session_id": sid},
                timeout=2.0
            )
            if resp.status_code != 200:
                failed_webhooks += 1
        except:
            failed_webhooks += 1
            
        terminated_count += 1

    db.session.commit()
    
    AuditLogger.log_action(
        actor_id=getattr(g, 'user_id', 'system'),
        action="USER_QUARANTINED",
        target_id=user_id,
        payload={
            "sessions_terminated": terminated_count,
            "role": getattr(g, 'role', 'system'),
            "platform": "SECURITY_PLATFORM",
            "req_id": getattr(g, 'req_id', 'unknown')
        }
    )
    
    return jsonify({
        "status": "success",
        "user_id": user_id,
        "sessions_terminated": terminated_count,
        "failed_webhooks": failed_webhooks,
        "message": f"Global quarantine executed. {terminated_count} sessions terminated."
    }), 200
