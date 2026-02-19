from backend.app import app
from backend.database.db import db
from backend.database.models import User, Session, SessionMetric, AuditLog, SimulationSession, SimulationEvent, DemoSession, DemoEvent

with app.app_context():
    print("Dropping all tables...")
    db.drop_all()
    print("Creating all tables...")
    db.create_all()
    print("Database reset complete.")
