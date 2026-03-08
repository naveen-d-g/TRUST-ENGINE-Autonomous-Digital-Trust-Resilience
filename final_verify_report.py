from backend.app import app
from backend.db.models import Session
import json

with app.app_context():
    sessions = Session.query.filter(Session.session_id.like('%_SIM_%')).all()
    with open('verify_report.txt', 'w', encoding='utf-8') as f:
        f.write(f"{'Session ID':<20} | {'Decision':<10} | {'Cause':<30} | {'Action'}\n")
        f.write("-" * 120 + "\n")
        for s in sessions:
            f.write(f"{s.session_id:<20} | {s.final_decision:<10} | {s.primary_cause:<30} | {s.recommended_action}\n")
    print("Report written to verify_report.txt")
