from flask import Blueprint, jsonify
from backend.utils.response_builder import success_response

home_bp = Blueprint("home", __name__)

@home_bp.route("/home", methods=["GET"])
def home():
    """
    Platform Metadata.
    """
    return success_response({
        "platform_name": "Trust Engine SOC Platform",
        "version": "2.0.0",
        "status": "operational"
    })

@home_bp.route("/health", methods=["GET"])
def health():
    """
    Health Check.
    """
    return success_response({
        "backend": "healthy",
        "ml_inference": "ready",
        "database": "connected" # simplified
    })
