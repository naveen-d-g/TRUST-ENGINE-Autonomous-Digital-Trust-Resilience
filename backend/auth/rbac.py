from backend.auth.platform import Platform
from backend.auth.roles import Role

RBAC_POLICY = {
    Platform.USER: {
        Role.VIEWER: ["emit_event"],
        Role.ANALYST: [],
        Role.ADMIN: [],
    },
    Platform.SECURITY: {
        Role.VIEWER: ["read"],
        Role.ANALYST: ["read", "propose"],
        Role.ADMIN: ["read", "propose", "approve", "recover"],
    }
}

def is_allowed(platform, role, action):
    """
    Validates if a role on a given platform is permitted to perform an action.
    """
    # Defensive casting just in case strings are passed
    if isinstance(platform, str):
        try:
            platform = Platform(platform)
        except ValueError:
            return False
            
    if isinstance(role, str):
        try:
            role = Role(role)
        except ValueError:
            return False
            
    return action in RBAC_POLICY.get(platform, {}).get(role, [])

from functools import wraps
from flask import request, jsonify
from backend.config import Config

def require_api_key(f):
    """
    Validates X-API-Key header against config.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        api_key = request.headers.get("X-API-Key")
        if not api_key or api_key != Config.API_KEY:
             return jsonify({"error": "Invalid or missing API Key"}), 401
        return f(*args, **kwargs)
    return decorated

def require_role(required_role):
    """
    Requested for Blocker #3 lifecycle enforcement.
    Restored for backward compatibility.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            role = request.headers.get("X-Role")
            platform = request.headers.get("X-Platform")

            if platform != "SECURITY_PLATFORM":
                return jsonify({"error": "Invalid platform", "code": "PLATFORM_VIOLATION"}), 403

            if role != required_role:
                 return jsonify({"error": "Insufficient Privileges", "code": "ROLE_VIOLATION"}), 403

            return fn(*args, **kwargs)
        return wrapper
    return decorator

def require(role=None, platform=None):
    """
    Original 'require' decorator used by existing routes.
    Restored to fix system-wide imports.
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            h_role = request.headers.get("X-Role")
            h_platform = request.headers.get("X-Platform")
            
            if platform and h_platform != platform:
                return jsonify({"error": "Platform Violation"}), 403
            if role and h_role != role:
                return jsonify({"error": "Role Violation"}), 403
                
            return fn(*args, **kwargs)
        return wrapper
    return decorator
