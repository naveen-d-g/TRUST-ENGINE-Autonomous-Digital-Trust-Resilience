from backend.extensions import db
from backend.db.models import AuditLog
import hashlib
import json

class AuditLogger:
    @staticmethod
    def log_action(actor_id: str, action: str, target_id: str = None, payload: dict = None):
        # Get last log for chaining
        last_log = AuditLog.query.order_by(AuditLog.timestamp.desc()).first()
        prev_hash = last_log.curr_hash if last_log else "0" * 64
        
        # Compute current hash
        log_content = f"{prev_hash}{actor_id}{action}{json.dumps(payload or {})}"
        curr_hash = hashlib.sha256(log_content.encode()).hexdigest()
        
        log = AuditLog(
            actor_id=actor_id,
            action=action,
            target_id=target_id,
            payload=payload,
            prev_hash=prev_hash,
            curr_hash=curr_hash
        )
        db.session.add(log)
        db.session.commit()
        return log
