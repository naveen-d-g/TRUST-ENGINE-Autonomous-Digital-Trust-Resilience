from backend.app import app
from backend.extensions import db
from backend.db.models import Session, SessionMetric, AuditLog, Incident, Event, BatchJob, BatchRawEvent

with app.app_context():
    try:
        db.session.query(SessionMetric).delete()
        db.session.query(Incident).delete()
        db.session.query(Event).delete()
        db.session.query(BatchRawEvent).delete()
        db.session.query(BatchJob).delete()
        db.session.query(Session).delete()
        
        # Audit logs might be immutable
        try:
            db.session.query(AuditLog).delete()
        except Exception:
            db.session.rollback()
        
        db.session.commit()
        print("[OK] Database cleared of all simulation and batch data.")
    except Exception as e:
        db.session.rollback()
        print(f"[ERROR] Database clear failed: {e}")
