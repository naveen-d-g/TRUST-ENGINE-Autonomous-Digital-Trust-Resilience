from flask import Blueprint, request, jsonify
from backend.middleware.platform_guard import PlatformGuard
from backend.services.ingestion_service import IngestionService

user_bp = Blueprint('user_platform', __name__, url_prefix='/platform/user')

@user_bp.route('/events/<event_type>', methods=['POST'])
@PlatformGuard.require_platform(PlatformGuard.PLATFORM_USER)
def ingest_event(event_type):
    """
    Single entry point for all user events (web, api, auth, system).
    """
    payload = request.json
    
    if event_type == "web":
        result = IngestionService.ingest_http_event(payload)
    elif event_type == "api":
         result = IngestionService.ingest_api_event(payload)
    elif event_type == "auth":
         result = IngestionService.ingest_auth_event(payload)
    elif event_type == "system":
         result = IngestionService.ingest_infra_event(payload)
    elif event_type == "network":
         result = IngestionService.ingest_network_event(payload)
    else:
        return jsonify({"error": "InvalidEventType"}), 400
        
    return jsonify(result), 200
