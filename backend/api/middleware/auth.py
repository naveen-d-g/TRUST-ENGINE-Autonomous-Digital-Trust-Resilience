from flask import request, jsonify, current_app
from functools import wraps

from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity

def check_auth():
    """
    Validates API Key from X-API-Key header OR a valid JWT.
    """
    # 1. Check API Key
    api_key = request.headers.get("X-API-Key") or request.args.get("token")
    required_key = current_app.config.get("API_KEY", "dev-api-key")
    
    if api_key and api_key == required_key:
        return True

    # 2. Fallback to JWT
    try:
        verify_jwt_in_request(optional=True)
        if get_jwt_identity():
            return True
    except:
        pass

    return False

def auth_middleware(app):
    @app.before_request
    def check_api_auth():
        if request.method == "OPTIONS" or (request.endpoint and ("health" in request.endpoint or "login" in request.endpoint or "demo" in request.endpoint or "sim" in request.endpoint)):
            return


            
        if not check_auth():
            return jsonify({"error": "Unauthorized", "message": "Invalid or missing API Key"}), 401
