from flask import Blueprint, request, jsonify
from backend.contracts.event_contract import EventContract
from backend.session.session_state_engine import SessionStateEngine
from backend.ml.adapter import evaluate_session
from backend.extensions import db
from backend.models.event import Event
from backend.models.session import Session as SessionModel

bp = Blueprint("user", __name__, url_prefix="/api/user")
engine = SessionStateEngine()

@bp.route("/event", methods=["POST"])
def ingest_event():
    # 1. Strict Validation
    try:
        event_data = EventContract(**request.json)
    except Exception as e:
        return jsonify({"error": "Malformed Event", "details": str(e)}), 400

    # 2. Check for Duplicates (Idempotency)
    existing_event = Event.query.filter_by(event_id=event_data.event_id).first()
    if existing_event:
        return jsonify({
            "status": "already_ingested",
            "event_id": event_data.event_id,
            "message": "Event has already been processed"
        }), 200

    # 3. Persist to PostgreSQL
    new_event = Event(
        event_id=event_data.event_id,
        session_id=event_data.session_id,
        domain=event_data.domain,
        actor_type=event_data.actor_type,
        actor_id=event_data.actor_id,
        tenant_id=event_data.tenant_id,
        ingestion_source=event_data.ingestion_source,
        event_type=event_data.event_type,
        payload=event_data.payload,
        timestamp=event_data.timestamp
    )
    db.session.add(new_event)
    
    # Update or create session
    sess = SessionModel.query.filter_by(session_id=event_data.session_id).first()
    if not sess:
        sess = SessionModel(session_id=event_data.session_id, user_id=event_data.actor_id)
        db.session.add(sess)
    
    db.session.commit()

    # 3. Buffer and Evaluate
    engine.ingest(event_data)
    snapshot = engine.snapshot(event_data.session_id)
    ml_result = evaluate_session(snapshot)
    
    return jsonify({
        "status": "accepted",
        "event_id": event_data.event_id,
        "ml": ml_result
    }), 202
