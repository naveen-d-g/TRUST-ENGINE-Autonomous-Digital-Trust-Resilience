from backend.extensions import db
from backend.models.user import User
from backend.models.session import Session
from backend.models.event import Event
from backend.models.signal import Signal
from backend.models.incident import Incident
from backend.db.models import AuditLog
from backend.contracts.enums import Role

def seed():
    """Seed the database with a default admin user."""
    db.create_all()
    admin_email = "dghere@admin"
    if not User.query.filter_by(email=admin_email).first():
        admin = User(
            email=admin_email,
            password="dghere", # Note: Using plain password as per prompt requirement
            role=Role.ADMIN
        )
        db.session.add(admin)
        db.session.commit()
        print(f"[SEED] Created admin user: {admin_email}")
    else:
        print(f"[SEED] Admin user already exists.")

    # Create a predictable test incident for easier testing
    test_inc_id = "INC-DEBUG-001"
    if not Incident.query.filter_by(incident_id=test_inc_id).first():
        incident = Incident(
            incident_id=test_inc_id,
            title="Static Test Incident",
            state=Role.VIEWER, # Wait, I shouldn't use Role for incident state
            affected_sessions=["sess-001"]
        )
        # Fix: IncidentState is an enum
        from backend.contracts.enums import IncidentState
        incident.state = IncidentState.OPEN
        db.session.add(incident)
        db.session.commit()
        print(f"[SEED] Created test incident: {test_inc_id}")

if __name__ == "__main__":
    from backend.app import create_app
    app = create_app()
    with app.app_context():
        seed()
