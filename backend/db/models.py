from backend.extensions import db
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid

# Enums
# We use strings in DB but validate via Contracts/App logic
# to avoid DB migration complexities with Enum types for now, 
# but strictly enforce values in application layer.

class Session(db.Model):
    __tablename__ = 'sessions'
    session_id = db.Column(db.String(36), primary_key=True)
    tenant_id = db.Column(db.String(50), nullable=False, default="default")
    user_id = db.Column(db.String(36), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_seen = db.Column(db.DateTime, default=datetime.utcnow)
    risk_score = db.Column(db.Float, default=0.0)
    
    # SOC Logic / Risk Fusion Fields (Added from backend.models.session)
    trust_score = db.Column(db.Float, default=100.0)
    final_decision = db.Column(db.String(20), default="ALLOW")
    primary_cause = db.Column(db.String(255))
    recommended_action = db.Column(db.String(255))
    ip_address = db.Column(db.String(50))
    session_duration_sec = db.Column(db.Integer, default=0)
    risk_reasons = db.Column(db.JSON) # Stores contributing factors as JSON
    
    # Bot Detection Fields
    bot_detected = db.Column(db.Boolean, default=False)
    bot_reason = db.Column(db.Text, nullable=True)
    
    # Source tracking: PROD (Real-time), BATCH (Uploaded), DEMO (Simulated)
    source = db.Column(db.String(20), default="PROD", index=True)

    events = db.relationship('Event', backref='session', lazy=True)
    signals = db.relationship('Signal', backref='session', lazy=True)
    snapshots = db.relationship('SessionSnapshot', backref='session', lazy=True)

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_seen": self.last_seen.isoformat() if self.last_seen else None,
            "trust_score": self.trust_score,
            "risk_score": self.risk_score,
            "final_decision": self.final_decision,
            "primary_cause": self.primary_cause,
            "recommended_action": self.recommended_action,
            "ip_address": self.ip_address,
            "session_duration_sec": self.session_duration_sec,
            "bot_detected": self.bot_detected,
            "bot_reason": self.bot_reason,
            "source": self.source
        }

class SessionSnapshot(db.Model):
    """
    Persisted Snapshot for ML reproducibility and Audit.
    """
    __tablename__ = 'session_snapshots'
    snapshot_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = db.Column(db.String(36), db.ForeignKey('sessions.session_id'), nullable=False)
    tenant_id = db.Column(db.String(50), nullable=False)
    
    window_start = db.Column(db.DateTime, nullable=False)
    window_end = db.Column(db.DateTime, nullable=False)
    aggregated_features = db.Column(db.JSON, nullable=False)
    canonical_event_hashes = db.Column(db.JSON, nullable=False) # List of hashes used
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Event(db.Model):
    __tablename__ = 'events'
    event_id = db.Column(db.String(36), primary_key=True)
    session_id = db.Column(db.String(36), db.ForeignKey('sessions.session_id'), nullable=False)
    tenant_id = db.Column(db.String(50), nullable=False)
    
    domain = db.Column(db.String(20), nullable=False) 
    actor_type = db.Column(db.String(20), nullable=False) 
    actor_id = db.Column(db.String(50), nullable=False)
    ingestion_source = db.Column(db.String(50), nullable=False)
    
    event_type = db.Column(db.String(50), nullable=False)
    payload = db.Column(db.JSON, nullable=False) 
    timestamp = db.Column(db.DateTime, nullable=False)
    canonical_hash = db.Column(db.String(64), nullable=False, unique=True) # Idempotency enforced
    ingested_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.event_id,
            "session_id": self.session_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "payload": self.payload,
            "domain": self.domain,
            "actor_id": self.actor_id,
            "ingestion_source": self.ingestion_source
        }

class Signal(db.Model):
    __tablename__ = 'signals'
    signal_id = db.Column(db.String(36), primary_key=True)
    session_id = db.Column(db.String(36), db.ForeignKey('sessions.session_id'), nullable=False)
    incident_id = db.Column(db.String(36), db.ForeignKey('incidents.incident_id'), nullable=True)
    
    signal_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(20), nullable=False)
    risk_score = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    signal_metadata = db.Column(db.JSON)

    def to_dict(self):
        return {
            "signal_id": self.signal_id,
            "session_id": self.session_id,
            "signal_type": self.signal_type,
            "severity": self.severity,
            "risk_score": self.risk_score,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "metadata": self.signal_metadata
        }

from backend.incidents.enums import IncidentStatus, IncidentSeverity

class Incident(db.Model):
    __tablename__ = "incidents"

    incident_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    # Alias for compatibility if needed, but schema uses incident_id
    
    tenant_id = db.Column(db.String, nullable=False)

    status = db.Column(db.Enum(IncidentStatus), nullable=False, default=IncidentStatus.OPEN)
    severity = db.Column(db.Enum(IncidentSeverity), nullable=False, default=IncidentSeverity.MEDIUM)

    created_at = db.Column(db.DateTime, server_default=func.now())
    updated_at = db.Column(db.DateTime, onupdate=func.now())

    def to_dict(self):
        return {
            "incident_id": str(self.incident_id),
            "tenant_id": self.tenant_id,
            "status": self.status.value,
            "severity": self.severity.value,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class RecoveryAction(db.Model):
    """
    Link Recovery to Incidents.
    """
    __tablename__ = 'recovery_actions'
    action_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = db.Column(db.String(36), db.ForeignKey('incidents.incident_id'), nullable=False)
    tenant_id = db.Column(db.String(50), nullable=False)
    
    action_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="PENDING")
    executed_by = db.Column(db.String(50), nullable=False) # Actor ID
    executed_at = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.JSON)

class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    prev_hash = db.Column(db.String, nullable=False)
    hash = db.Column(db.String, nullable=False, unique=True)

    actor = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    platform = db.Column(db.String, nullable=False)
    tenant_id = db.Column(db.String, nullable=False, default="DEFAULT")
    request_id = db.Column(db.String, nullable=False)

    action = db.Column(db.String, nullable=False)
    incident_id = db.Column(db.String, nullable=True)
    details = db.Column(db.JSON, nullable=False)

    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<AuditLog {self.action} @ {self.created_at}>"

from sqlalchemy import event

# 🔒 HARD IMMUTABILITY GUARD
@event.listens_for(AuditLog, "before_update")
def forbid_audit_update(mapper, connection, target):
    raise RuntimeError("Audit logs are immutable")

@event.listens_for(AuditLog, "before_delete")
def forbid_audit_delete(mapper, connection, target):
    raise RuntimeError("Audit logs are immutable")

class SessionMetric(db.Model):
    __tablename__ = 'session_metrics'
    
    metric_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String(36), db.ForeignKey('sessions.session_id'), nullable=False)
    
    # ML Probabilities
    bot_probability = db.Column(db.Float, default=0.0)
    attack_probability = db.Column(db.Float, default=0.0)
    anomaly_score = db.Column(db.Float, default=0.0)
    risk_score = db.Column(db.Float, default=0.0)
    
    # Risk Fusion Breakdown
    web_abuse_probability = db.Column(db.Float, default=0.0)
    api_abuse_probability = db.Column(db.Float, default=0.0)
    network_anomaly_score = db.Column(db.Float, default=0.0)
    infra_stress_score = db.Column(db.Float, default=0.0)
    
    anomaly_amplified = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            "bot_probability": self.bot_probability,
            "attack_probability": self.attack_probability,
            "anomaly_score": self.anomaly_score,
            "risk_score": self.risk_score,
            "web_abuse_probability": self.web_abuse_probability,
            "api_abuse_probability": self.api_abuse_probability,
            "network_anomaly_score": self.network_anomaly_score,
            "infra_stress_score": self.infra_stress_score
        }

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(50), unique=True, nullable=True)
    role = db.Column(db.String(20), nullable=False)
    platform = db.Column(db.String(20), nullable=False)
    # Merged User fields
    email = db.Column(db.String(255), unique=True, nullable=True) # Ensure app can use email
    password_hash = db.Column(db.String(255), nullable=True) # Ensure app can use password_hash
    password_reset_required = db.Column(db.Boolean, default=False)
    
    api_key_hash = db.Column(db.String(128))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "user_id": str(self.user_id),
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "platform": self.platform,
            "password_reset_required": self.password_reset_required,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class BatchJob(db.Model):
    __tablename__ = 'batch_jobs'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name = db.Column(db.String(255), nullable=False)
    uploaded_by = db.Column(db.String(36), nullable=False)
    status = db.Column(db.String(20), default="PROCESSING") # PROCESSING, COMPLETED, FAILED
    total_rows = db.Column(db.Integer, default=0)
    processed_rows = db.Column(db.Integer, default=0)
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime, nullable=True)
    result_hash = db.Column(db.String(64), nullable=True) # For deterministic verification

    events_raw = db.relationship('BatchRawEvent', backref='job', lazy=True)

    def to_dict(self):
        return {
            "id": str(self.id),
            "file_name": self.file_name,
            "status": self.status,
            "total_rows": self.total_rows,
            "processed_rows": self.processed_rows,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "result_hash": self.result_hash
        }

class BatchRawEvent(db.Model):
    __tablename__ = 'batch_events_raw'
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    batch_id = db.Column(UUID(as_uuid=True), db.ForeignKey('batch_jobs.id'), nullable=False)
    session_id = db.Column(db.String(36), nullable=False, index=True)
    user_id = db.Column(db.String(36), nullable=True)
    event_type = db.Column(db.String(50), nullable=False)
    ip = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, nullable=False)
    payload = db.Column(JSONB, nullable=False)

class MonitoringEvent(db.Model):
    """
    High-volume events for Domain-Orchestrated Monitoring.
    Stores raw event data + ML risk score + Decision + Suggestion.
    """
    __tablename__ = 'monitoring_events'
    
    # Primary Key
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = db.Column(db.String(36), unique=True, nullable=False)
    
    # Domain & Session Context
    domain = db.Column(db.String(20), nullable=False, index=True) # WEB, API, NETWORK, SYSTEM
    session_id = db.Column(db.String(36), index=True, nullable=True) # Can be null for system events
    actor_id = db.Column(db.String(50), nullable=True)
    ip = db.Column(db.String(50), nullable=True)
    route = db.Column(db.String(255), nullable=True)
    
    # Intelligence
    risk_score = db.Column(db.Float, default=0.0)
    decision = db.Column(db.String(20), default="ALLOW") # ALLOW, RESTRICT, ESCALATE
    suggestion = db.Column(db.String(255), nullable=True)
    
    # Metadata
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    payload = db.Column(JSONB, nullable=True) # Optional extra details
    
    def to_dict(self):
        return {
            "id": str(self.id),
            "event_id": self.event_id,
            "domain": self.domain,
            "session_id": self.session_id,
            "actor_id": self.actor_id,
            "ip": self.ip,
            "route": self.route,
            "risk_score": self.risk_score,
            "decision": self.decision,
            "suggestion": self.suggestion,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "payload": self.payload
        }
