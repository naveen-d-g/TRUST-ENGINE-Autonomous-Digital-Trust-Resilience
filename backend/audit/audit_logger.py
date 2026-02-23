from backend.extensions import db
from backend.db.models import AuditLog
import hashlib
import json

class AuditLogger:
    @staticmethod
    def log_action(actor_id: str, action: str, target_id: str = None, payload: dict = None):
        # Get last log for chaining. Models use created_at, not timestamp.
        last_log = AuditLog.query.order_by(AuditLog.created_at.desc()).first()
        prev_hash = last_log.hash if last_log else "0" * 64
        
        # Compute current hash
        log_content = f"{prev_hash}{actor_id}{action}{json.dumps(payload or {})}"
        curr_hash = hashlib.sha256(log_content.encode()).hexdigest()
        
        log = AuditLog(
            actor=actor_id,
            action=action,
            incident_id=target_id,         # Mapping target_id to incident_id as appropriate
            details=payload or {},
            prev_hash=prev_hash,
            hash=curr_hash,
            role=payload.get("role", "system") if payload else "system",
            platform=payload.get("platform", "SECURITY_PLATFORM") if payload else "SECURITY_PLATFORM",
            request_id=payload.get("req_id", "unknown") if payload else "unknown",
            tenant_id="DEFAULT"
        )
        db.session.add(log)
        db.session.commit()
        return log
