from flask import request, abort, g
from backend.contracts.enums import Platform, Role

def auth_middleware(app):
    @app.before_request
    def check_auth():
        # Allow OPTIONS requests for CORS preflight
        if request.method == "OPTIONS":
            return
        
        # Exempt public endpoints
        public_paths = ["/", "/favicon.ico", "/api/health", "/api/auth/login", "/api/auth/register", "/api/v1/health", "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/live/history"]
        if request.path in public_paths or request.path.startswith("/socket.io") or request.path.startswith("/api/v1/live/stream"):
            return

        api_key = request.headers.get("X-API-Key")
        platform = request.headers.get("X-Platform")
        role = request.headers.get("X-Role")

        # Strict API Key Check
        if api_key != "dev-api-key":
            abort(401, "Invalid or missing X-API-Key")

        # Platform & Role Validation
        try:
            from backend.auth.context import AuthContext
            
            # Normalize and validate
            p_val = platform.strip().upper() if platform else None
            r_val = role.strip().upper() if role else None
            
            p = Platform(p_val) if p_val else None
            r = Role(r_val) if r_val else None
            
            if not p or not r:
                abort(400, "Missing X-Platform or X-Role header")
                
            g.auth = AuthContext(
                user_id="ANONYMOUS",
                role=r,
                platform=p,
                tenant_id="DEFAULT",
                api_key_id="DEV_KEY"
            )
        except ValueError as e:
            print(f"[AUTH ERROR] Invalid Platform/Role value: {e}")
            abort(400, "Invalid X-Platform or X-Role header")
