import os
import sys
from flask import Flask
from dotenv import load_dotenv

# Add project root to sys.path to allow absolute imports of 'backend'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Load env before importing config
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '../.env')))

from backend.config import Config
from backend.extensions import db
# 🔒 Import models from the central location for registry
from backend.db.models import User, Session, SessionMetric, Event, Incident, AuditLog

def reset_database():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    
    with app.app_context():
        print("Connected to database.")
        if db.engine.dialect.name == 'postgresql':
            from sqlalchemy import text
            print("Detected PostgreSQL. Using CASCADE drop...")
            db.session.execute(text("DROP SCHEMA public CASCADE; CREATE SCHEMA public;"))
            db.session.commit()
        else:
            print("Dropping all tables...")
            db.drop_all()
        print("All tables dropped.")
        
        print("Creating all tables with new schema...")
        db.create_all()
        print("Database schema recreated successfully.")

if __name__ == "__main__":
    reset_database()
