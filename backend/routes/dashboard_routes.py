from flask import Blueprint, jsonify
from backend.auth.decorators import require_access
from backend.contracts.enums import Role
from backend.models.session import Session
from backend.models.session_metric import SessionMetric
from backend.db.models import Incident
from backend.extensions import db
from sqlalchemy import func
from backend.utils.logger import log_error

from datetime import datetime, timedelta

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route("/metrics", methods=["GET"])
@require_access(role=Role.VIEWER)  # Allow all authenticated users
def get_dashboard_metrics():
    """
    Get dashboard metrics in the format expected by frontend DashboardMetricsDTO
    """
    try:
        # Total sessions
        total_sessions = Session.query.count()
        
        # Active sessions (sessions created in last hour)
        from datetime import datetime, timedelta
        one_hour_ago = datetime.utcnow() - timedelta(hours=1)
        active_sessions = Session.query.filter(Session.created_at >= one_hour_ago).count()
        
        # Incidents
        active_incidents = Incident.query.filter(Incident.status.in_(['OPEN', 'CONTAINED'])).count()
        critical_incidents = Incident.query.filter(
            Incident.severity == 'CRITICAL',
            Incident.status.in_(['OPEN', 'CONTAINED'])
        ).count()
        
        # Average risk score
        avg_risk = db.session.query(func.avg(SessionMetric.risk_score)).scalar() or 0
        
        # Blocked sessions (REJECT decision)
        blocked_sessions = Session.query.filter(Session.final_decision == 'REJECT').count()
        
        # Global trust score (average)
        global_trust = db.session.query(func.avg(Session.trust_score)).scalar() or 0
        
        # Bot vs attack ratio
        bot_avg = db.session.query(func.avg(SessionMetric.bot_probability)).scalar() or 0
        attack_avg = db.session.query(func.avg(SessionMetric.attack_probability)).scalar() or 0
        attack_ratio = round(bot_avg / attack_avg, 2) if attack_avg > 0 else round(bot_avg, 2)
        
        # Decision distribution
        decision_dist_query = db.session.query(
            Session.final_decision, 
            func.count(Session.final_decision)
        ).group_by(Session.final_decision).all()
        
        sessions_by_decision = {res[0]: res[1] for res in decision_dist_query}
        
        # Map to expected format
        decision_distribution = {
            'trusted': sessions_by_decision.get('ALLOW', 0),
            'suspicious': sessions_by_decision.get('CHALLENGE', 0),
            'malicious': sessions_by_decision.get('REJECT', 0)
        }
        
        # Severity distribution (from incidents)
        severity_dist_query = db.session.query(
            Incident.severity,
            func.count(Incident.severity)
        ).group_by(Incident.severity).all()
        
        sessions_by_severity = {res[0]: res[1] for res in severity_dist_query}
        
        
        # 🧪 SIMULATION: Fetch latest recommendation per domain
        domain_recs = {}
        for domain in ['WEB', 'API', 'NETWORK', 'SYSTEM']:
            # Get absolute latest session for this domain (regardless of recommendation)
            latest_session = Session.query.filter(
                Session.session_id.like(f'{domain}%')
            ).order_by(Session.last_seen.desc()).first()
            
            if latest_session and latest_session.recommended_action:
                # Check for stale data (e.g., > 30 seconds old)
                is_fresh = False
                if latest_session.last_seen:
                    # Handle both offset-naive and aware datetimes if necessary, but assuming UTC naive from DB
                    time_diff = datetime.utcnow() - latest_session.last_seen
                    if time_diff.total_seconds() < 30: # Only show active threats
                        is_fresh = True

                # Only show if fresh AND not generic/safe
                if is_fresh and \
                   latest_session.recommended_action.lower() not in ['monitor', 'none'] and \
                   "no specific recovery action" not in latest_session.recommended_action.lower() and \
                   "manual security review" not in latest_session.recommended_action.lower():
                    key = 'infra' if domain == 'SYSTEM' else domain.lower()
                    domain_recs[key] = latest_session.recommended_action


        # 🛡️ Domain Risk Breakdown (Real-time)
        domain_risk_res = db.session.query(
            func.avg(SessionMetric.web_abuse_probability).label('web'),
            func.avg(SessionMetric.api_abuse_probability).label('api'),
            func.avg(SessionMetric.network_anomaly_score).label('network'),
            func.avg(SessionMetric.infra_stress_score).label('infra')
        ).first()
        
        domain_risk = {
            "web": round(float(domain_risk_res[0] or 0) * 100, 1),
            "api": round(float(domain_risk_res[1] or 0) * 100, 1),
            "network": round(float(domain_risk_res[2] or 0) * 100, 1),
            "infra": round(float(domain_risk_res[3] or 0) * 100, 1)
        }

        # Calculate real primary risk vectors from causes in the last 24h
        last_24h = datetime.utcnow() - timedelta(hours=24)
        risk_vectors_query = db.session.query(
            Session.primary_cause, 
            func.count(Session.primary_cause)
        ).filter(
            Session.created_at >= last_24h,
            Session.primary_cause != None,
            Session.primary_cause != "Allow"
        ).group_by(Session.primary_cause).order_by(func.count(Session.primary_cause).desc()).limit(5).all()
        
        # Calculate total risk instances to get percentages
        total_risk_instances = sum(res[1] for res in risk_vectors_query) or 1
        primary_risk_vectors = [
            {"name": res[0], "value": round((res[1] / total_risk_instances) * 100, 1)} 
            for res in risk_vectors_query
        ] or [{"name": "No active threats", "value": 0}]

        return jsonify({
            "total_sessions": total_sessions, 
            "active_sessions": active_sessions,
            "active_incidents": active_incidents,
            "critical_incidents": critical_incidents,
            "avg_risk_score": float(avg_risk),
            "blocked_sessions": blocked_sessions,
            "global_trust_score": round(float(global_trust), 1),
            "attack_ratio": attack_ratio,
            "sessions_by_decision": sessions_by_decision,
            "sessions_by_severity": sessions_by_severity,
            "decision_distribution": {
                "trusted": sessions_by_decision.get('ALLOW', 0),
                "suspicious": sessions_by_decision.get('CHALLENGE', 0),
                "malicious": sessions_by_decision.get('TERMINATED', 0) + sessions_by_decision.get('REJECT', 0)
            },
            "domain_risk": domain_risk,
            "detection_sensitivity": "High",
            "domain_recommendations": domain_recs,
            "primary_risk_vectors": primary_risk_vectors
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        log_error("Dashboard Metrics Failure", error=e)
        return jsonify(error="Internal Server Error", message=str(e)), 500
