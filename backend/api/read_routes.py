from flask import Blueprint, jsonify
from backend.models.event import Event
from backend.models.session import Session
from backend.models.user import User

read_bp = Blueprint("read", __name__, url_prefix="/api")

@read_bp.route("/events", methods=["GET"])
def list_events():
    events = Event.query.order_by(Event.ingested_at.desc()).all()
    return jsonify([e.to_dict() for e in events])

@read_bp.route("/events/<event_id>", methods=["GET"])
def get_event(event_id):
    event = Event.query.filter_by(event_id=event_id).first_or_404()
    return jsonify(event.to_dict())

@read_bp.route("/sessions", methods=["GET"])
def list_sessions():
    sessions = Session.query.all()
    return jsonify([s.to_dict() for s in sessions])

@read_bp.route("/sessions/<session_id>", methods=["GET"])
def get_session(session_id):
    session = Session.query.filter_by(session_id=session_id).first_or_404()
    return jsonify(session.to_dict())

@read_bp.route("/users", methods=["GET"])
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users])

@read_bp.route("/users/<user_id>", methods=["GET"])
def get_user(user_id):
    # Try both id and email for lookup if needed, but following prompt which uses id
    user = User.query.filter_by(id=user_id).first_or_404()
    return jsonify(user.to_dict())
