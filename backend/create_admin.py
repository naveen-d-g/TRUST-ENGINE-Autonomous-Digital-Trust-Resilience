from backend.app import app
from backend.database.db import db
from backend.database.models import User

with app.app_context():
    if not User.query.filter_by(email="admin@trust.ai").first():
        print("Creating admin user...")
        admin = User(user_id="admin_01", email="admin@trust.ai", role="admin")
        admin.set_password("admin123")
        db.session.add(admin)
        db.session.commit()
        print("Admin user created: admin@trust.ai / admin123")
    else:
        print("Admin user already exists.")
