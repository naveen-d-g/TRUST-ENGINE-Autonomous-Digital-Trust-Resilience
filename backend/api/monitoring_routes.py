from flask import Blueprint, request, jsonify
from backend.monitoring.consumers.domain_consumer import DomainConsumer

monitoring_bp = Blueprint("monitoring", __name__)

consumers = {
    "WEB": DomainConsumer("WEB"),
    "API": DomainConsumer("API"),
    "NETWORK": DomainConsumer("NETWORK"),
    "SYSTEM": DomainConsumer("SYSTEM")
}

@monitoring_bp.route("/ingest", methods=["POST"])
def ingest_event():
    """
    Ingest a monitoring event for a specific domain.
    """
    data = request.json
    domain = data.get("domain")
    
    if domain not in consumers:
        return jsonify({"error": f"Invalid domain: {domain}"}), 400
        
    consumer = consumers[domain]
    try:
        event = consumer.process_event(data)
        if event:
             return jsonify({"status": "success", "event_id": str(event.id)}), 200
        else:
             return jsonify({"error": "Processing failed"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@monitoring_bp.route("/metrics", methods=["GET"])
def metrics():
    """
    Expose Prometheus metrics (Stub).
    """
    # In a real app, use prometheus_client.generate_latest()
    return jsonify({
        "web_events": 100,
        "api_events": 50,
        "network_events": 200,
        "system_events": 10
    })
