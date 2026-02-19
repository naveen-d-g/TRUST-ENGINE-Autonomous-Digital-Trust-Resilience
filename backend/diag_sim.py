import sys
import os
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = str(Path(__file__).resolve().parent.parent)
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from backend.app import app
from backend.database.db import db
from backend.database.models import User, SimulationSession
from backend.services.simulation_service import SimulationService

with app.app_context():
    try:
        # Check if admin user exists
        user = User.query.filter_by(email="admin@trust.ai").first()
        if not user:
            print("Admin user not found, creating...")
            user = User(user_id="admin_01", email="admin@trust.ai", role="admin")
            user.set_password("admin123")
            db.session.add(user)
            db.session.commit()
        
        print(f"Testing SimulationService.start_simulation for user: {user.user_id}")
        result = SimulationService.start_simulation(user.user_id)
        print("Success:", result)
        
    except Exception as e:
        import traceback
        print("ERROR:")
        traceback.print_exc()
