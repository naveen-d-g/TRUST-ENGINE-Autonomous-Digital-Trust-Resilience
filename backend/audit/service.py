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
        last_entry = AuditLog.query.order_by(AuditLog.created_at.desc()).first()
        prev_hash = last_entry.hash if last_entry else "0" * 64
        
        timestamp = datetime.utcnow()
        import hashlib
        entry_hash = hashlib.sha256(f"{prev_hash}{actor_id}{action}{timestamp.isoformat()}".encode()).hexdigest()

        entry = AuditLog(
            prev_hash=prev_hash,
            hash=entry_hash,
            actor=actor_id,
            role=role,
            platform=platform,
            action=action,
            request_id="NONE",
            details={},
            created_at=timestamp
        )
        
        db.session.add(entry)
        db.session.commit()
        return entry
