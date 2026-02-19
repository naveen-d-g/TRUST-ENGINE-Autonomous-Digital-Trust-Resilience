from backend.extensions import db

# Helpers for transaction management can go here
def reset_database():
    db.drop_all()
    db.create_all()
