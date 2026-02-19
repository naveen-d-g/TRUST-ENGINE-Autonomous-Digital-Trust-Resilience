from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    """
    Liveness & Readiness Probe.
    Static response for infrastructure bootstrap.
    """
    return jsonify({
        "status": "ok",
        "mode": "normal",
        "models": {
            "champion": "ACTIVE",
            "challenger": "ACTIVE" 
        },
        "drift": "none",
        "async_queue_depth": 0
    }), 200
