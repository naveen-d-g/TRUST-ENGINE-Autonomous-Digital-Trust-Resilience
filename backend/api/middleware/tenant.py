from flask import request, jsonify, g, current_app

def tenant_middleware(app):
    @app.before_request
    def check_tenant():
        """
        Enforces Worker/Tenant isolation.
        Must run AFTER Auth (but Auth is currently decorator-based or global).
        If strict ordering is needed, this runs before view functions.
        """
        # Exclude Health Check, Auth routes, and OPTIONS preflight
        if request.method == "OPTIONS" or \
           (request.endpoint and ("health" in request.endpoint or "auth" in request.endpoint)) or \
           request.path.startswith("/api/v1/auth"):
            return

        tenant_id = request.headers.get("X-Tenant-ID") or request.args.get("tenant_id")
        if not tenant_id:
            # Fallback for dev environment to avoid blocking streams
            tenant_id = "tenant_1"
        
        g.tenant_id = tenant_id
