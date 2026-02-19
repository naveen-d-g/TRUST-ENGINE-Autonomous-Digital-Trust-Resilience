from datetime import datetime
from backend.models.session import Session
from backend.database import db

def update_session(session_id, user_id):
    sess = Session.query.filter_by(session_id=session_id).first()
    if not sess:
        sess = Session(session_id=session_id, user_id=user_id)
        db.session.add(sess)

    sess.last_seen = datetime.utcnow()
    sess.event_count = (sess.event_count or 0) + 1
    db.session.commit()
