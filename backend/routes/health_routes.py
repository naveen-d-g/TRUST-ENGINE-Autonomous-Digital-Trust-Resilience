
from flask import Blueprint, jsonify
from backend.config import PROJECT_NAME, VERSION

health_bp = Blueprint('health', __name__)

@health_bp.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy",
        "project": PROJECT_NAME,
        "version": VERSION
    })
