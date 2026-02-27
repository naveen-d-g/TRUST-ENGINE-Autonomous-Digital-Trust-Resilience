from flask import Blueprint, jsonify, abort, request, g
from backend.auth.decorators import require_access
from backend.contracts.enums import Role
from backend.models.session import Session
from backend.models.session_metric import SessionMetric
from backend.models.event import Event
from backend.db.models import Incident
from backend.extensions import db
from sqlalchemy import func
from backend.utils.logger import log_error
from datetime import datetime, timedelta
import random

metrics_bp = Blueprint('metrics', __name__)

@metrics_bp.route("/summary", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_summary():
    try:
        # Get decision distribution
        dist_query = db.session.query(Session.final_decision, func.count(Session.final_decision)).group_by(Session.final_decision).all()
        dist = {res[0]: res[1] for res in dist_query}
        
        # Get average trust score (15-minute sliding window)
        # We include TERMINATED sessions in this sliding window to reflect the impact of recent attacks
        recent_window = datetime.utcnow() - timedelta(minutes=15)
        avg_trust_val = db.session.query(func.avg(Session.trust_score))\
            .filter(Session.created_at >= recent_window)\
            .filter(Session.primary_cause != 'Terminated (System Reset)').scalar()
            
        if avg_trust_val is None:
            # Fallback to all non-terminated sessions if no recent activity
            avg_trust_val = db.session.query(func.avg(Session.trust_score))\
                .filter(Session.final_decision != 'TERMINATED').scalar()
        
        avg_trust = float(avg_trust_val) if avg_trust_val is not None else 100.0
        
        # Get top causes
        top_causes_query = db.session.query(Session.primary_cause, func.count(Session.primary_cause)).group_by(Session.primary_cause).order_by(func.count(Session.primary_cause).desc()).limit(5).all()
        top_causes = [res[0] for res in top_causes_query]
        
        # Calculate bot vs attack ratio
        bot_avg = db.session.query(func.avg(SessionMetric.bot_probability)).scalar() or 0
        attack_avg = db.session.query(func.avg(SessionMetric.attack_probability)).scalar() or 0
        ratio = round(bot_avg / attack_avg, 2) if attack_avg > 0 else 0
        
        # Get trust evolution over time (hourly avg for last 24 hours)
        last_24h = datetime.utcnow() - timedelta(hours=24)
        trend_query = db.session.query(
            func.to_char(Session.created_at, 'HH24:00').label('hour'),
            func.avg(Session.trust_score).label('avg_trust')
        ).filter(Session.created_at >= last_24h).group_by('hour').order_by('hour').all()
        
        trust_evolution = [{"time": res[0], "value": float(res[1])} for res in trend_query]

        # Domain Risk Breakdown
        domain_risk_res = db.session.query(
            func.avg(SessionMetric.web_abuse_probability).label('web'),
            func.avg(SessionMetric.api_abuse_probability).label('api'),
            func.avg(SessionMetric.network_anomaly_score).label('network'),
            func.avg(SessionMetric.infra_stress_score).label('infra')
        ).first()
        
        domain_breakdown = {
            "web": float(domain_risk_res[0] or 0) * 100,
            "api": float(domain_risk_res[1] or 0) * 100,
            "network": float(domain_risk_res[2] or 0) * 100,
            "infra": float(domain_risk_res[3] or 0) * 100
        }

        # Risk Score Trend (Proxy for Velocity History), excluding TERMINATED
        risk_trend_query = db.session.query(
            func.to_char(Session.created_at, 'HH24:00').label('hour'),
            func.avg(SessionMetric.risk_score).label('avg_risk')
        ).join(SessionMetric, Session.session_id == SessionMetric.session_id)\
         .filter(Session.created_at >= last_24h)\
         .filter(Session.final_decision != 'TERMINATED')\
         .group_by('hour').order_by('hour').all()
         
        risk_history = [{"time": res[0], "value": float(res[1])} for res in risk_trend_query]
        
        # Enterprise Policy Decisions (Mocked/Aggregated from Session data)
        allow_count = dist.get('ALLOW', 0)
        restrict_count = dist.get('CHALLENGE', 0) + dist.get('RESTRICT', 0)
        escalate_count = dist.get('REJECT', 0) + dist.get('ESCALATE', 0)

        return jsonify({
            "decision_distribution": dist,
            "average_trust_score": float(avg_trust),
            "top_risk_causes": top_causes,
            "bot_vs_attack_ratio": ratio,
            "trust_evolution": trust_evolution,
            "domain_breakdown": domain_breakdown,
            "risk_history": risk_history,
            "metrics": {
                "global_risk_score": 100 - float(avg_trust),
                "active_sessions": Session.query.filter(Session.created_at >= last_24h).count(),
                "active_incidents": Incident.query.filter(Incident.status == 'OPEN').count(),
                "risk_velocity": round(random.uniform(-0.5, 0.5), 2) if 'random' in locals() else 0.1,
                "allow_count": allow_count,
                "restrict_count": restrict_count,
                "escalate_count": escalate_count,
                "active_node": "US-EAST-ENTERPRISE-01"
            }
        })
    except Exception as e:
        log_error("Summary Metrics Failure", error=e)
        return jsonify(error="Internal Server Error", message=str(e)), 500

from backend.services.observation_service import SessionStateEngine

@metrics_bp.route("/session/<session_id>", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_session_detail(session_id):
    try:
        # 1. Try Live In-Memory State first (Rich data with events)
        if session_id in SessionStateEngine._sessions:
            live_data = SessionStateEngine._sessions[session_id]
            # Convert deque of Events to list of dicts
            events_list = [e.to_dict() for e in live_data["events"]]
            
            # Use get_session_features to get the computed metrics
            features = SessionStateEngine.get_session_features(session_id)
            
            # Fetch latest risk from history
            risk_history = SessionStateEngine.get_risk_history(session_id)
            latest_risk = risk_history[-1][1] if risk_history else 0
            
            # Estimate Trust (Simple provisional calc for UI)
            # In pipeline, trust = fn(risk, base_trust). Here we approximate.
            provisional_trust = max(0, 100 - latest_risk)
            
            # Construct a response that mimics the DB model but with extra events
            return jsonify({
                "session_id": session_id,
                "is_live": True,
                "events": events_list,
                "trust_score": provisional_trust, 
                "risk_score": latest_risk, # Added for UI
                **features,
                # Add default fields expected by frontend if missing
                "final_decision": "ANALYZING", # Better than PENDING
                "primary_cause": "Live Observation"
            })

        # 2. Fallback to Database (Historical / Archived)
        session = db.session.get(Session, session_id)
        if not session:
            return jsonify(error="Not Found", message=f"Session {session_id} not found"), 404
        
        data = session.to_dict()
        data["is_live"] = False
        data["events"] = [] # DB doesn't store raw events in this schema yet
        return jsonify(data)
    except Exception as e:
        log_error("Session Detail Failure", session_id=session_id, error=e)
        return jsonify(error="Internal Server Error", message=str(e)), 500

@metrics_bp.route("/sessions", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_sessions():
    try:
        limit = request.args.get('limit', 50, type=int)
        offset = request.args.get('offset', 0, type=int)
        decision = request.args.get('decision')
        
        query = Session.query
        if decision and decision.upper() != 'ALL':
            query = query.filter(func.upper(Session.final_decision) == decision.upper())
            
        cause = request.args.get('cause')
        if cause:
             query = query.filter(Session.primary_cause.ilike(f"%{cause}%"))

        source = request.args.get('source')
        if source:
             query = query.filter(func.lower(Session.source) == source.lower())
            
        sessions = query.order_by(Session.created_at.desc()).limit(limit).offset(offset).all()
        return jsonify([s.to_dict() for s in sessions])
    except Exception as e:
        log_error("Sessions List Failure", error=e)
        return jsonify(error="Internal Server Error", message=str(e)), 500
@metrics_bp.route("/domain/<domain_type>", methods=["GET"])
@require_access(role=Role.ANALYST)
def get_domain_metrics(domain_type):
    try:
        domain_type = domain_type.lower()
        
        # 1. Base query setup
        query = db.session.query(SessionMetric)
        
        # 2. Risk Calculation Logic (Simplified for Demo)
        # In a real app, this would be complex SQL or rolling window Aggregations
        avg_risk = 0
        active_threats = 0
        velocity = 0.0
        recommendation = "Maintain observation."
        
        # Calculate specialized metrics based on domain
        if domain_type == 'web':
            # Focus on Web Abuse & Auth
            res = db.session.query(func.avg(SessionMetric.web_abuse_probability)).scalar()
            avg_risk = (res or 0) * 100
            
            # Count recent high risk sessions
            active_threats = Session.query.filter(Session.trust_score < 30).count()
            
            if avg_risk > 70: recommendation = "Enable Captcha & Rate Limiting"
            elif avg_risk > 40: recommendation = "Review WAF Logs"
            
        elif domain_type == 'api':
            # Focus on API Abuse
            res = db.session.query(func.avg(SessionMetric.api_abuse_probability)).scalar()
            avg_risk = (res or 0) * 100
            
            active_threats = Session.query.filter(Session.primary_cause.ilike('%api%')).count()
            
            if avg_risk > 60: recommendation = "Rotate API Keys & Audit Scopes"
            
        elif domain_type == 'network':
            # Focus on Network Anomalies
            res = db.session.query(func.avg(SessionMetric.network_anomaly_score)).scalar()
            avg_risk = (res or 0) * 100
            
            # Mock threats for network (since we just added adapter, DB might be empty)
            active_threats = 2 if avg_risk > 50 else 0
            
            if avg_risk > 80: recommendation = "Isolate Compromised Segments"
            elif avg_risk > 50: recommendation = "Close Unused Ports"
            
        elif domain_type == 'infra':
            # Focus on Infra Stress
            res = db.session.query(func.avg(SessionMetric.infra_stress_score)).scalar()
            avg_risk = (res or 0) * 100
            
            if avg_risk > 85: recommendation = "Scale Auto-Scaling Group"
            elif avg_risk > 60: recommendation = "Investigate High CPU processes"
        
        # Velocity Simulation (Random fluctuation for liveness if no history)
        import random
        velocity = round(random.uniform(-5.0, 5.0), 1)

        return jsonify({
            "domain": domain_type,
            "risk_score": int(avg_risk),
            "active_threats": active_threats,
            "risk_velocity": velocity,
            "recommended_action": recommendation
        })
        
    except Exception as e:
        log_error(f"Domain Metrics Failure ({domain_type})", error=e)
        return jsonify(error="Internal Server Error", message=str(e)), 500
