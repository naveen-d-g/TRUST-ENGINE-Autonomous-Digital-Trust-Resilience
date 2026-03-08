from backend.app import create_app
from backend.db.models import Incident, Session
from backend.extensions import db
from sqlalchemy import func
from datetime import datetime, timedelta

app = create_app()
with app.app_context():
    open_incidents = Incident.query.filter_by(status="OPEN").count()
    recent_sessions = Session.query.filter(Session.last_seen >= datetime.utcnow() - timedelta(minutes=5)).count()
    avg_trust = db.session.query(func.avg(Session.trust_score)).filter(Session.last_seen >= datetime.utcnow() - timedelta(minutes=5)).scalar()
    
    print(f"Open Incidents: {open_incidents}")
    print(f"Recent Sessions: {recent_sessions}")
    print(f"Avg Trust (Recent): {avg_trust}")
