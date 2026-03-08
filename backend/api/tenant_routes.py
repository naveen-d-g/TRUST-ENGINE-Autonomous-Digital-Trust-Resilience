from flask import Blueprint, jsonify
from backend.utils.response_builder import success_response

tenant_bp = Blueprint("tenants", __name__)

@tenant_bp.route("/tenants", methods=["GET", "OPTIONS"])
def get_tenants():
    """
    Returns a list of available tenants for the bootstrap process.
    """
    tenants = [
        {"id": "tenant_1", "name": "Global Operations"},
        {"id": "tenant_2", "name": "Regional SOC"},
        {"id": "local_dev", "name": "Local Development"}
    ]
    return jsonify(tenants)
