from flask import Blueprint, request, jsonify
from pydantic import ValidationError
from backend.contracts.event_contract import EventContract
from backend.extensions import db
from backend.models.event import Event as EventModel
from sqlalchemy.exc import IntegrityError
from uuid import uuid4

web_bp = Blueprint("web_bp", __name__, url_prefix="/api/ingest")

@web_bp.route("/web", methods=["POST"])
def ingest_web_event():
    try:
        # 🚨 STRICT VALIDATION — Using model_validate_json for correct ISO parsing in strict mode
        event_data = EventContract.model_validate_json(request.data)
    except ValidationError as e:
        # 🚨 Must return 400
        return jsonify({
            "error": "Invalid Event Contract",
            "details": e.errors()
        }), 400

    # Only executes if validation passed
    new_event = EventModel(
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

    try:
        db.session.add(new_event)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Duplicate event_id", "event_id": event_data.event_id}), 409

    return jsonify({"status": "accepted"}), 202
