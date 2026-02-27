import uuid
from backend.audit.hash_chain import compute_hash
from backend.audit.audit_models import AuditLog
from backend.audit.audit_contract import AuditContract
from backend.extensions import db

class AuditLogger(AuditContract):
    """
    SOC-grade immutable audit logger with hash-chaining.
    """
    def append(self, payload: dict):
        # 1. Fetch latest entry for chain linking
        last = (
            AuditLog.query.order_by(AuditLog.created_at.desc()).first()
        )
        prev_hash = last.hash if last else "GENESIS"

        # 2. Build canonical payload for hashing
        full_payload = {
            "actor": payload.get("actor", "SYSTEM"),
            "role": payload.get("role", "SYSTEM"),
            "platform": payload.get("platform", "SYSTEM"),
            "tenant_id": payload.get("tenant_id", "DEFAULT"),
            "request_id": payload.get("request_id", str(uuid.uuid4())),
            "action": payload.get("action", "LOG"),
            "incident_id": payload.get("incident_id"),
            "details": payload.get("details", {})
        }

        # 3. Compute cryptographically linked hash
        new_hash = compute_hash(prev_hash, full_payload)

        # 4. Create immutable record
        entry = AuditLog(
            id=str(uuid.uuid4()),
            prev_hash=prev_hash,
            hash=new_hash,
            **full_payload
        )

        db.session.add(entry)
        db.session.commit()

    def verify_chain(self) -> bool:
        """
        Validates the entire hash chain from root to tip.
        Handles non-deterministic DB ordering by following hash links.
        """
        all_logs = AuditLog.query.all()
        if not all_logs:
            return True
        
        # 1. Map logs by their prev_hash for traversal
        logs_by_prev = {log.prev_hash: log for log in all_logs}
        
        current_prev = "GENESIS"
        verified_count = 0
        
        while current_prev in logs_by_prev:
            log = logs_by_prev[current_prev]
            
            # Reconstruct identical payload for verification
            payload = {
                "actor": log.actor,
                "role": log.role,
                "platform": log.platform,
                "tenant_id": log.tenant_id,
                "request_id": log.request_id,
                "action": log.action,
                "incident_id": log.incident_id,
                "details": log.details
            }
            
            recomputed = compute_hash(log.prev_hash, payload)
            if log.hash != recomputed:
                return False
            
            current_prev = log.hash
            verified_count += 1
            
        return verified_count == len(all_logs)

    # Legacy Compatibility Methods
    @classmethod
    def log_system_event(cls, event_type: str, message: str, severity: str = "INFO"):
        logger = cls()
        logger.append({
            "action": event_type,
            "details": {"message": message, "severity": severity}
        })

    @classmethod
    def log_incident_transition(cls, incident_id: str, old_state: str, new_state: str, actor: str, role: str):
        logger = cls()
        logger.append({
            "action": "INCIDENT_TRANSITION",
            "incident_id": incident_id,
            "actor": actor,
            "role": role,
            "platform": "SECURITY_PLATFORM",
            "details": {
                "old_state": old_state,
                "new_state": new_state
            }
        })

    @classmethod
    def log_enforcement(cls, proposal_id: str, action_taken: str, status: str, reason: str):
        logger = cls()
        logger.append({
            "action": "ENFORCEMENT_ACTION",
            "details": {
                "proposal_id": proposal_id,
                "action_taken": action_taken,
                "status": status,
                "reason": reason
            }
        })
