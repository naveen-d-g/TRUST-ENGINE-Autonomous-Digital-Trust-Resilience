from flask import request, g, jsonify
from backend.config import Config
from backend.auth.auth_context import Role, Platform

def auth_middleware(app):
    @app.before_request
    def before_request():
        # Exempt public metadata and health endpoints
        public_paths = ["/", "/api/health", "/api/home", "/favicon.ico"]
        if request.path in public_paths or (request.endpoint and "static" in request.endpoint):
            return
            
        # 1. Tracing
        g.req_id = request.headers.get("X-Request-ID", "unknown")
        
        # 2. Key Validation
        api_key = request.headers.get(Config.API_KEY_HEADER)
        if not api_key: # Strict: API Key Required
            return jsonify({"error": "Missing API Key", "code": "AUTH_REQUIRED"}), 401
        
        # 3. Context Injection (Strict Enums)
        # In prod, this comes from DB lookup of API Key
        # Here we trust headers for simulation, but validate values
        try:
            role_str = request.headers.get("X-Role", Role.VIEWER.value).upper()
            platform_str = request.headers.get("X-Platform", Platform.USER.value).upper()
            
            # Context Set
            g.role = Role(role_str).value
            g.platform = Platform(platform_str).value
            g.user_id = request.headers.get("X-User-ID", "system")
            g.tenant_id = request.headers.get("X-Tenant-ID", "default")
            
        except ValueError:
            return jsonify({"error": "Invalid Auth Context Headers"}), 400

        # 4. Platform Isolation (Blocking Rule 4)
        # Security roles allowed ONLY on Security Platform
        if g.role in [Role.ADMIN.value, Role.ANALYST.value] and g.platform != Platform.SECURITY.value:
             return jsonify({
                "error": "Security roles require Security Platform context.",
                "code": "PLATFORM_MISMATCH"
            }), 403
