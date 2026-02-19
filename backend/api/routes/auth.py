
from flask import Blueprint, jsonify, request

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/me', methods=['GET'])
def get_current_user():
    """
    Returns the current authenticated user.
    Since we rely on X-API-Key for this SOC demo, we return a mock SOC Analyst profile.
    """
    # In a real app, this would come from the session or JWT decoded from the header.
    return jsonify({
        "user": {
            "user_id": "user-soc-001",
            "username": "analyst@trust.platform",
            "role": "analyst", 
            "tenant_id": "tenant-default-01",
            "permissions": ["view:soc", "action:enforce", "view:incidents"]
        }
    })

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Mock login endpoint.
    In this demo, the frontend already has the API Key.
    This just confirms connectivity.
    """
    return jsonify({"status": "success", "token": "mock-session-token"})

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({"status": "success"})
