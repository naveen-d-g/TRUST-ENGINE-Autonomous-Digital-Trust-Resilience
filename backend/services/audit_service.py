from backend.db.models import AuditLog
from backend.database import db

def log(action, actor, source):
    entry = AuditLog(action=action, actor=actor, source=source)
    db.session.add(entry)
    db.session.commit()
