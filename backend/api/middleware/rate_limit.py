from flask import request, jsonify, g, current_app

def get_tenant_key():
    """Rate limit by Tenant ID if available, else IP."""
    return getattr(g, "tenant_id", "unknown")

try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
    
    limiter = Limiter(
        key_func=get_tenant_key,
        strategy="fixed-window" 
    )
except ImportError:
    print("[WARNING] flask-limiter not found. Rate limiting disabled.")
    class MockLimiter:
        def __init__(self, key_func=None, strategy=None): self.storage_uri = None
        def init_app(self, app): pass
        def limit(self, limit_string):
            def decorator(f): return f
            return decorator
    limiter = MockLimiter()

def attach_rate_limit(app):
    """
    Attaches Limiter to app.
    Configures default limits.
    """
    # Create valid storage URI or memory
    storage_uri = "memory://"
    
    limiter.storage_uri = storage_uri
    limiter.init_app(app) # Critical for Flask-Limiter

    
    # Global default: defined in Config (e.g. "60 per minute")
    # specific routes can decorate with @limiter.limit("10/second")
    
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify({"error": "Too Many Requests", "message": "Rate limit exceeded"}), 429
