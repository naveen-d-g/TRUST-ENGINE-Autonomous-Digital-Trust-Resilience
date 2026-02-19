from flask import Blueprint, request, jsonify
from backend.services.ingestion_service import IngestionService
from backend.auth.rbac import require_api_key
from backend.extensions import limiter

ingestion_bp = Blueprint('ingestion', __name__)

@ingestion_bp.route('/web', methods=['POST'])
@require_api_key
@limiter.exempt
def ingest_web():
    """
    Ingest Web Layer events (e.g., Nginx access logs).
    """
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload provided"}), 400
            
        # Flatten payload if nested (Monitor sends structure with 'payload' dict)
        if "payload" in payload and isinstance(payload["payload"], dict):
            flat_payload = payload["payload"].copy()
            # Merge top-level metadata (domain, actor_id, etc.) excluding 'payload'
            flat_payload.update({k: v for k, v in payload.items() if k != "payload"})
            final_payload = flat_payload
        else:
            final_payload = payload

        result = IngestionService.ingest_http_event(final_payload)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingestion_bp.route('/api', methods=['POST'])
@require_api_key
@limiter.exempt
def ingest_api():
    """
    Ingest API Layer events (e.g., Gateway logs).
    """
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload provided"}), 400

        # Flatten payload
        if "payload" in payload and isinstance(payload["payload"], dict):
            flat_payload = payload["payload"].copy()
            flat_payload.update({k: v for k, v in payload.items() if k != "payload"})
            final_payload = flat_payload
        else:
            final_payload = payload
            
        result = IngestionService.ingest_api_event(final_payload)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingestion_bp.route('/system', methods=['POST'])
@require_api_key
@limiter.exempt
def ingest_system():
    """
    Ingest System/Infra Layer events (e.g., CPU spikes).
    """
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload provided"}), 400

        # Flatten payload
        if "payload" in payload and isinstance(payload["payload"], dict):
            flat_payload = payload["payload"].copy()
            flat_payload.update({k: v for k, v in payload.items() if k != "payload"})
            final_payload = flat_payload
        else:
            final_payload = payload
            
        result = IngestionService.ingest_infra_event(final_payload)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@ingestion_bp.route('/network', methods=['POST'])
@require_api_key
@limiter.exempt
def ingest_network():
    """
    Ingest Network Layer events (e.g., Port scans).
    """
    try:
        payload = request.get_json()
        if not payload:
            return jsonify({"error": "No payload provided"}), 400

        # Flatten payload
        if "payload" in payload and isinstance(payload["payload"], dict):
            flat_payload = payload["payload"].copy()
            flat_payload.update({k: v for k, v in payload.items() if k != "payload"})
            final_payload = flat_payload
        else:
            final_payload = payload
            
        result = IngestionService.ingest_network_event(final_payload)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
