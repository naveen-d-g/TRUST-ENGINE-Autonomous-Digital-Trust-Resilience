from flask import Blueprint, request, jsonify
from backend.db.models import Incident
from backend.incidents.incident_manager import IncidentManager
from backend.incidents.lifecycle import IncidentState
from backend.auth.rbac import require_role
from backend.extensions import db

bp = Blueprint("incidents", __name__)
manager = IncidentManager()

@bp.route("/api/soc/incidents/<incident_id>/contain", methods=["POST"])
@require_role("ADMIN")
def contain_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    try:
        result = manager.transition(
            incident,
            IncidentState.CONTAINED,
            request.headers.get("X-Role"),
            request.headers.get("X-Platform")
        )
        return jsonify(result), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400

@bp.route("/api/soc/incidents/<incident_id>/recover", methods=["POST"])
@require_role("ADMIN")
def recover_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    try:
        result = manager.transition(
            incident,
            IncidentState.RECOVERING,
            request.headers.get("X-Role"),
            request.headers.get("X-Platform")
        )
        return jsonify(result), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400

@bp.route("/api/soc/incidents/<incident_id>/resolve", methods=["POST"])
@require_role("ADMIN")
def resolve_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    try:
        result = manager.transition(
            incident,
            IncidentState.RESOLVED,
            request.headers.get("X-Role"),
            request.headers.get("X-Platform")
        )
        return jsonify(result), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400

@bp.route("/api/soc/incidents/<incident_id>/close", methods=["POST"])
@require_role("ADMIN")
def close_incident(incident_id):
    incident = Incident.query.get_or_404(incident_id)
    try:
        result = manager.transition(
            incident,
            IncidentState.CLOSED,
            request.headers.get("X-Role"),
            request.headers.get("X-Platform")
        )
        return jsonify(result), 200
    except RuntimeError as e:
        return jsonify({"error": str(e)}), 400

@bp.route("/api/soc/incidents", methods=["POST"])
@require_role("ADMIN")
def create_incident():
    data = request.json
    incident = Incident(
        severity=data.get("severity", "MEDIUM")
    )
    db.session.add(incident)
    db.session.commit()
    return jsonify(incident.to_dict()), 201
