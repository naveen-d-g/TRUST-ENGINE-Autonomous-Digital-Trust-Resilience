from datetime import datetime
from backend.audit.models import AuditLog
from backend.extensions import db

class AuditService:
    @staticmethod
    def log(actor_id, role, platform, action):
        """
        Implements hash-chained logging.
        Retrieves last entry hash as prev_hash for new entry.
        """
        last_entry = AuditLog.query.order_by(AuditLog.timestamp.desc()).first()
        prev_hash = last_entry.entry_hash if last_entry else "0" * 64
        
        timestamp = datetime.utcnow()
        entry_hash = AuditLog.compute_hash(prev_hash, actor_id, action, timestamp)

        entry = AuditLog(
            prev_hash=prev_hash,
            entry_hash=entry_hash,
            actor_id=actor_id,
            role=role,
            platform=platform,
            action=action,
            timestamp=timestamp
        )
        
        db.session.add(entry)
        db.session.commit()
        return entry
