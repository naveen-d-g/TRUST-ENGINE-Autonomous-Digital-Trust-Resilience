import pandas as pd
import json
from flask import Flask
from backend.database.db import db
from backend.database.models import User, Session, SessionMetric, AuditLog
from backend.config import SQLALCHEMY_DATABASE_URI, EXPLANATIONS_DATASET_PATH

def migrate():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    db.init_app(app)
    
    with app.app_context():
        # Drop all to ensure clean state with new schema
        db.drop_all()
        db.create_all()
        
        # Add Admin
        from backend.database.models import User
        if not User.query.filter_by(email="admin@trust.ai").first():
            admin = User(user_id="admin_01", email="admin@trust.ai", role="admin")
            admin.set_password("admin123")
            db.session.add(admin)

        print("Migrating CSV to DB with Full Metadata...")
        df = pd.read_csv(EXPLANATIONS_DATASET_PATH, nrows=2000)
        
        for _, row in df.iterrows():
            sid = str(row['session_id'])
            
            # Handle risk reasons
            reasons = row.get('risk_reasons', '[]')
            if isinstance(reasons, str) and not reasons.startswith('['):
                reasons = json.dumps([reasons])
            elif not isinstance(reasons, str):
                reasons = json.dumps([])

            s = Session(
                session_id=sid,
                trust_score=float(row['trust_score']),
                final_decision=str(row['final_decision']),
                primary_cause=str(row.get('primary_cause', 'Unknown')),
                recommended_action=str(row.get('recommended_action', 'N/A')),
                ip_address=str(row.get('ip_address', '127.0.0.1')),
                session_duration_sec=int(row.get('session_duration_sec', 0)),
                risk_reasons=reasons
            )
            db.session.add(s)
            
            m = SessionMetric(
                session_id=sid,
                bot_probability=float(row.get('bot_probability', 0)),
                attack_probability=float(row.get('attack_probability', 0)),
                anomaly_score=float(row.get('anomaly_score', 0)),
                risk_score=float(row.get('risk_score', 0)),
                anomaly_amplified=bool(row.get('anomaly_amplified', False))
            )
            db.session.add(m)
            
            l = AuditLog(
                session_id=sid,
                decision=str(row['final_decision']),
                reason=str(row.get('primary_cause', 'Bulk Migrated'))
            )
            db.session.add(l)
            
        db.session.commit()
        print("Done.")

if __name__ == "__main__":
    migrate()
