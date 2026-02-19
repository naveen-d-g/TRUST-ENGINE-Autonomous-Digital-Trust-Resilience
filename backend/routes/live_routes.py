from flask import Blueprint, request, jsonify, Response, stream_with_context, current_app, g
from backend.services.ingestion_service import IngestionService
from backend.services.observation_service import SessionStateEngine
from backend.auth.decorators import require_access
from backend.contracts.enums import Role
import json
import time
from flask_jwt_extended import decode_token
import queue

live_bp = Blueprint('live', __name__)

# ================= INGESTION ENDPOINTS (Push) =================

@live_bp.route('/ingest/http', methods=['POST'])
def ingest_http():
    payload = request.json
    result = IngestionService.ingest_http_event(payload)
    return jsonify(result), 200

@live_bp.route('/ingest/api', methods=['POST'])
def ingest_api():
    payload = request.json
    result = IngestionService.ingest_api_event(payload)
    return jsonify(result), 200

@live_bp.route('/ingest/auth', methods=['POST'])
def ingest_auth():
    payload = request.json
    result = IngestionService.ingest_auth_event(payload)
    return jsonify(result), 200

@live_bp.route('/ingest/network', methods=['POST'])
def ingest_network():
    payload = request.json
    result = IngestionService.ingest_network_event(payload)
    return jsonify(result), 200
    
@live_bp.route('/ingest/infra', methods=['POST'])
def ingest_infra():
    payload = request.json
    result = IngestionService.ingest_infra_event(payload)
    return jsonify(result), 200

# ================= MONITORING ENDPOINTS (Connect) =================

@live_bp.route('/history', methods=['GET'])
# @require_access(role=Role.ANALYST)
def get_history():
    print(f"[LIVE DEBUG] History requested by {getattr(g, 'auth', 'Public User')}")
    """
    Returns the recent global event history (snapshot).
    Supports 'domain' query param to filter by source/type.
    """
    domain_filter = request.args.get('domain', 'all').lower()
    
    # Snapshot current history
    history = list(SessionStateEngine.get_global_history())
    
    events = []
    for evt in history:
        # Re-use filtering logic (similar to stream)
        should_include = True
        if domain_filter != 'all':
            etype = evt.event_type
            if domain_filter == 'web':
                if etype not in ['http', 'auth']: should_include = False
            elif domain_filter == 'network':
                if etype != 'network': should_include = False
            elif domain_filter == 'infra':
                if etype != 'infra': should_include = False
            elif domain_filter == 'api':
                if etype != 'api': should_include = False
            elif domain_filter != etype:
                 should_include = False
        
        if should_include:
            d = evt.to_dict()
            d["risk_score"] = getattr(evt, 'risk_score', 0)
            events.append(d)
            
    return jsonify(events), 200

@live_bp.route('/stream', methods=['GET'])
def get_live_stream():
    """
    Returns a realtime Server-Sent Events (SSE) stream of events.
    Authentication is done via 'token' query parameter since EventSource doesn't support headers easily.
    """
    token = request.args.get('token')
    if not token:
        return jsonify(error="Unauthorized", message="Missing token"), 401
        
    # Standard Dev Fallback
    if token == current_app.config.get("API_KEY", "dev-api-key"):
        # Allow bypass for dev
        pass
    else:
        try:
            decoded = decode_token(token)
            # ... additional checks ...
        except Exception as e:
             return jsonify(error="Unauthorized", message="Invalid token"), 401

    domain_filter = request.args.get('domain', 'all').lower()

    def generate():
        q = SessionStateEngine.listen()
        
        # Send initial connection message
        yield f"data: {json.dumps({'type': 'connected', 'active_sessions': len(SessionStateEngine._sessions)})}\n\n"
        
        try:
            while True:
                try:
                    # Block for up to 15 seconds waiting for an event
                    event = q.get(timeout=15)
                    
                    # Filtering Logic
                    # Filter map: web -> http, auth
                    should_emit = True
                    if domain_filter != 'all':
                        etype = event.event_type
                        if domain_filter == 'web':
                            if etype not in ['http', 'auth']: should_emit = False
                        elif domain_filter == 'network':
                            if etype != 'network': should_emit = False
                        elif domain_filter == 'infra':
                            if etype != 'infra': should_emit = False
                        elif domain_filter == 'api':
                            if etype != 'api': should_emit = False
                        elif domain_filter != etype:
                             should_emit = False

                    if not should_emit:
                        continue
                    
                    # Serialize event
                    evt_dict = event.to_dict()
                    evt_dict["risk_score"] = getattr(event, 'risk_score', 0)

                    # Map event_type/source to frontend Domain
                    etype = event.event_type
                    if etype in ['http', 'auth']:
                        evt_dict["domain"] = "WEB"
                    elif etype == 'api':
                        evt_dict["domain"] = "API"
                    elif etype == 'network':
                        evt_dict["domain"] = "NETWORK"
                    elif etype == 'infra':
                        evt_dict["domain"] = "SYSTEM"
                    else:
                        evt_dict["domain"] = "WEB" # Fallback

                    # SSE Format: data: <json>\n\n
                    yield f"data: {json.dumps(evt_dict)}\n\n"
                except queue.Empty:
                    # Timeout (Heartbeat)
                    yield f": heartbeat\n\n"
        except GeneratorExit:
            # Client disconnected
            pass
            
    return Response(stream_with_context(generate()), mimetype='text/event-stream')
