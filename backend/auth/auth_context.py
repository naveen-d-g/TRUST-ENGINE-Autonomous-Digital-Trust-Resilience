from enum import Enum
from functools import wraps
from flask import g, jsonify

class Platform(str, Enum):
    USER = "USER_PLATFORM"
    SECURITY = "SECURITY_PLATFORM"

class Role(str, Enum):
    VIEWER = "VIEWER"
    ANALYST = "ANALYST"
    ADMIN = "ADMIN"

def require_platform(platform: Platform):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_platform = getattr(g, "platform", None)
            # Normalize for comparison (DB might store as string)
            # Assuming Middleware sets g.platform as string
            if current_platform != platform.value:
                return jsonify({
                    "error": "Platform Context Violation", 
                    "required": platform.value,
                    "current": current_platform
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_role(role: Role):
    ROLES_HIERARCHY = {
        Role.VIEWER: 1,
        Role.ANALYST: 2,
        Role.ADMIN: 3
    }
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            current_role_str = getattr(g, "role", "VIEWER").upper()
            try:
                current_role = Role(current_role_str)
            except ValueError:
                return jsonify({"error": "Invalid Role Context"}), 403
                
            if ROLES_HIERARCHY[current_role] < ROLES_HIERARCHY[role]:
                 return jsonify({
                    "error": "Insufficient Privileges",
                    "required": role.value,
                    "current": current_role.value
                }), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
