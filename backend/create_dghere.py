from backend.app import app
from backend.database.db import db
from backend.database.models import User

with app.app_context():
    email = "dghere@admin"
    if not User.query.filter_by(email=email).first():
        print(f"Creating user {email}...")
        user = User(user_id="dghere", email=email, role="admin")
        user.set_password("dghere")
        db.session.add(user)
        db.session.commit()
        print(f"User created: {email} / dghere")
    else:
        print(f"User {email} already exists.")
