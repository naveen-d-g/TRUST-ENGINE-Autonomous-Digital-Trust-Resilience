from functools import wraps
from flask import request, jsonify

class PlatformGuard:
    """
    Middleware to enforce strict platform separation.
    """
    HEADER = "X-Platform-Type"
    PLATFORM_USER = "USER"
    PLATFORM_SECURITY = "SECURITY"
    
    @staticmethod
    def require_platform(platform_type: str):
        def decorator(f):
            @wraps(f)
            def decorated_function(*args, **kwargs):
                req_platform = request.headers.get(PlatformGuard.HEADER)
                
                # Development bypass (optional, remove in prod)
                # if not req_platform: return f(*args, **kwargs)
                
                if req_platform != platform_type:
                    return jsonify({
                        "error": "PlatformIsolationViolation",
                        "message": f"Endpoint restricted to {platform_type} Platform only."
                    }), 403
                    
                return f(*args, **kwargs)
            return decorated_function
        return decorator
