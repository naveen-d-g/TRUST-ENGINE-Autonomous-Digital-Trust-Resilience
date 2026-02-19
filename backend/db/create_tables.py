from backend.app import create_app
from backend.extensions import db
from backend.db.models import User, Session, Event, Incident, AuditLog, Signal

app = create_app()

def init_db():
    with app.app_context():
        print("Creating Core Tables...")
        try:
            db.create_all()
            print("Tables Created Successfully.")
            
            # Create Default Admin if not exists
            if not User.query.filter_by(username="admin").first():
                admin = User(
                    username="admin", 
                    role="admin", 
                    platform="security_platform",
                    api_key_hash="dev-hash" # mock
                )
                db.session.add(admin)
                db.session.commit()
                print("Default Admin User Created.")
                
        except Exception as e:
            print(f"Database Initialization Failed: {e}")
            print("Ensure DATABASE_URL is set and PostgreSQL is running.")

if __name__ == "__main__":
    init_db()
