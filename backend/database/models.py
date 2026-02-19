from datetime import datetime
from backend.database.db import db
from flask_bcrypt import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.String(50), primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='analyst') # admin, analyst, viewer
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() + 'Z' if self.created_at else None,
            "last_login": self.last_login.isoformat() + 'Z' if self.last_login else None
        }

class SessionMetric(db.Model):
    __tablename__ = 'session_metrics'
    
    metric_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    session_id = db.Column(db.String(100), db.ForeignKey('sessions.session_id'), nullable=False)
    bot_probability = db.Column(db.Float)
    attack_probability = db.Column(db.Float)
    anomaly_score = db.Column(db.Float)
    risk_score = db.Column(db.Float)
    anomaly_amplified = db.Column(db.Boolean, default=False)
    
    # New Risk Fusion Metrics
    web_abuse_probability = db.Column(db.Float, default=0.0)
    api_abuse_probability = db.Column(db.Float, default=0.0)
    network_anomaly_score = db.Column(db.Float, default=0.0)
    infra_stress_score = db.Column(db.Float, default=0.0)

    def to_dict(self):
        return {
            "bot_probability": self.bot_probability,
            "attack_probability": self.attack_probability,
            "anomaly_score": self.anomaly_score,
            "risk_score": self.risk_score,
            "anomaly_amplified": self.anomaly_amplified,
            "web_abuse_probability": self.web_abuse_probability,
            "api_abuse_probability": self.api_abuse_probability,
            "network_anomaly_score": self.network_anomaly_score,
            "infra_stress_score": self.infra_stress_score
        }

class Session(db.Model):
    __tablename__ = 'sessions'
    
    session_id = db.Column(db.String(100), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.user_id'), nullable=True)
    trust_score = db.Column(db.Float, nullable=False)
    final_decision = db.Column(db.String(20), nullable=False)
    primary_cause = db.Column(db.String(255))
    recommended_action = db.Column(db.String(255))
    ip_address = db.Column(db.String(50))
    session_duration_sec = db.Column(db.Integer)
    risk_reasons = db.Column(db.Text) # Stored as JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to metrics
    metrics = db.relationship('SessionMetric', backref='session', uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        import json
        reasons = []
        if self.risk_reasons:
            try:
                reasons = json.loads(self.risk_reasons)
            except:
                reasons = [self.risk_reasons]
                
        # Base dict
        data = {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "trust_score": self.trust_score,
            "final_decision": self.final_decision,
            "primary_cause": self.primary_cause,
            "recommended_action": self.recommended_action,
            "ip_address": self.ip_address,
            "session_duration_sec": self.session_duration_sec,
            "risk_reasons": reasons,
            "created_at": self.created_at.isoformat() + 'Z' if self.created_at else None
        }
        
        # Flatten metrics for frontend ease of access
        if self.metrics:
            m_dict = self.metrics.to_dict()
            data.update(m_dict)
            
        return data

from backend.audit.audit_models import AuditLog

class SimulationSession(db.Model):
    __tablename__ = 'simulation_sessions'
    
    simulation_id = db.Column(db.String(100), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.user_id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    final_trust_score = db.Column(db.Float)
    final_decision = db.Column(db.String(20))
    status = db.Column(db.String(20), default='ACTIVE') # ACTIVE, COMPLETED
    
    # Relationship to events
    events = db.relationship('SimulationEvent', backref='simulation', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "simulation_id": self.simulation_id,
            "user_id": self.user_id,
            "start_time": self.start_time.isoformat() + 'Z' if self.start_time else None,
            "end_time": self.end_time.isoformat() + 'Z' if self.end_time else None,
            "final_trust_score": self.final_trust_score,
            "final_decision": self.final_decision,
            "status": self.status
        }

class SimulationEvent(db.Model):
    __tablename__ = 'simulation_events'
    
    event_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    simulation_id = db.Column(db.String(100), db.ForeignKey('simulation_sessions.simulation_id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text) # JSON string
    current_trust_score = db.Column(db.Float)
    current_decision = db.Column(db.String(20))

    def to_dict(self):
        import json
        det = {}
        if self.details:
            try:
                det = json.loads(self.details)
            except:
                det = {"raw": self.details}
                
        return {
            "event_id": self.event_id,
            "simulation_id": self.simulation_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp.isoformat() + 'Z' if self.timestamp else None,
            "details": det,
            "current_trust_score": self.current_trust_score,
            "current_decision": self.current_decision
        }

class DemoSession(db.Model):
    __tablename__ = 'demo_sessions'
    
    demo_session_id = db.Column(db.String(100), primary_key=True)
    user_id = db.Column(db.String(50), db.ForeignKey('users.user_id'), nullable=False)
    start_time = db.Column(db.DateTime, default=datetime.utcnow)
    end_time = db.Column(db.DateTime)
    final_trust_score = db.Column(db.Float)
    final_decision = db.Column(db.String(20))
    status = db.Column(db.String(20), default='ACTIVE') # ACTIVE, COMPLETED
    
    events = db.relationship('DemoEvent', backref='demo_session', cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "demo_session_id": self.demo_session_id,
            "user_id": self.user_id,
            "start_time": self.start_time.isoformat() + 'Z' if self.start_time else None,
            "end_time": self.end_time.isoformat() + 'Z' if self.end_time else None,
            "final_trust_score": self.final_trust_score,
            "final_decision": self.final_decision,
            "status": self.status,
            "is_demo": True
        }

class DemoEvent(db.Model):
    __tablename__ = 'demo_events'
    
    event_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    demo_session_id = db.Column(db.String(100), db.ForeignKey('demo_sessions.demo_session_id'), nullable=False)
    event_type = db.Column(db.String(50), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text) # JSON string

    def to_dict(self):
        import json
        det = {}
        if self.details:
            try:
                det = json.loads(self.details)
            except:
                det = {"raw": self.details}
                
        return {
            "event_id": self.event_id,
            "demo_session_id": self.demo_session_id,
            "event_type": self.event_type,
            "timestamp": self.timestamp.isoformat() + 'Z' if self.timestamp else None,
            "details": det
        }
