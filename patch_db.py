from backend.app import create_app
from backend.extensions import db
from sqlalchemy import text
import traceback

app = create_app()

with app.app_context():
    try:
        db.session.execute(text("ALTER TABLE users ADD COLUMN password_reset_required BOOLEAN DEFAULT FALSE;"))
        db.session.commit()
        print("users added")
    except Exception as e:
        db.session.rollback()
        print("users error", type(e).__name__)

    try:
        db.session.execute(text("ALTER TABLE sessions ADD COLUMN bot_detected BOOLEAN DEFAULT FALSE;"))
        db.session.commit()
        print("bot_detected added")
    except Exception as e:
        db.session.rollback()
        print("bot_detected error", type(e).__name__)

    try:
        db.session.execute(text("ALTER TABLE sessions ADD COLUMN bot_reason TEXT;"))
        db.session.commit()
        print("bot_reason added")
    except Exception as e:
        db.session.rollback()
        print("bot_reason error", type(e).__name__)
    
    print("DB migration complete.")
