from flask import Blueprint, request, jsonify
from backend.contracts.event_contract import EventContract
from backend.services.session_service import update_session
from backend.models.event import Event
from backend.database import db

ingest_bp = Blueprint("ingest", __name__, url_prefix="/api/ingest")

@ingest_bp.route("/<domain>", methods=["POST"])
def ingest(domain):
    data = request.json
    data["domain"] = domain.upper()

    from backend.contracts.enums import Platform
    # Map common sources to Platform enum
    source_map = {
        "WEB": Platform.USER_PLATFORM,
        "USER": Platform.USER_PLATFORM,
        "API": Platform.USER_PLATFORM,
        "NETWORK": Platform.SECURITY_PLATFORM,
        "SYSTEM": Platform.SECURITY_PLATFORM,
        "USER_PLATFORM": Platform.USER_PLATFORM,
        "SECURITY_PLATFORM": Platform.SECURITY_PLATFORM
    }
    raw_source = data.get("ingestion_source", "").upper()
    data["ingestion_source"] = source_map.get(raw_source, Platform.USER_PLATFORM)
    
    # Ensure tenant_id is present
    if "tenant_id" not in data or not data["tenant_id"]:
        data["tenant_id"] = "DEFAULT_TENANT"

    from backend.contracts.event_contract import EventContract
    try:
        event_contract = EventContract(**data)
    except Exception as e:
        return jsonify({"error": "Validation Error", "details": str(e)}), 400

    # Ensure idempotency: check if event already exists
    existing_event = Event.query.filter_by(event_id=event_contract.event_id).first()
    if existing_event:
        return jsonify({"status": "accepted", "message": "Duplicate event ignored"}), 200

    new_event = Event.from_contract(event_contract)
    db.session.add(new_event)

    update_session(event_contract.session_id, event_contract.actor_id)
    
    # Trigger Incident Engine (Phase 1)
    from backend.incidents.incident_manager import IncidentManager
    IncidentManager.correlate(data)
    
    db.session.commit()

    return jsonify({"status": "accepted"}), 202
