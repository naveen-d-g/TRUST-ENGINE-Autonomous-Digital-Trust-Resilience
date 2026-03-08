import time
from flask import request, g, has_request_context
from backend.services.ingestion_service import IngestionService

class SecurityLogger:
    """
    Flask Middleware to capture API and Auth security events.
    Hooks into request lifecycle.
    """
    
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        app.before_request(self._before_request)
        app.after_request(self._after_request)

    def _before_request(self):
        g.start_time = time.time()

    def _after_request(self, response):
        if not has_request_context():
            return response
            
        # Ignore any request originating from the internal security platform
        # (suppresses background polling, dashboard metrics, etc.)
        if request.headers.get('X-Platform') == 'SECURITY_PLATFORM':
            return response

        # Ignore static files or health checks if needed
        IGNORE_PATHS = ['/static', '/api/v1/health']
        if any(request.path.startswith(p) for p in IGNORE_PATHS):
            return response
            
        # Determine duration
        duration_ms = int((time.time() - getattr(g, 'start_time', time.time())) * 1000)
        
        # Capture ALL requests as HTTP events
        self._log_http_event(response, duration_ms)
        
        # Additionally classify specialized events for potential double-logging or specific handling?
        # IngestionService.ingest_http_event handles normalization.
        # We can stick to one main ingest call for HTTP traffic to avoid duplicates, 
        # unless Auth/API are treated as separate streams.
        # For this requirement: "ALL HTTP/API traffic".
        # Let's log specific Auth events separately if needed, OR just tag them.
        
        return response

    def _log_http_event(self, response, duration):
        # Debug Print as requested
        print(f"[SECURITY] HTTP EVENT: {request.path} {response.status_code}")
        
        # Extract Token ID if present (Bearer)
        auth_header = request.headers.get('Authorization', '')
        token_id = "anonymous"
        if auth_header.startswith("Bearer "):
            token_id = auth_header.split(" ")[1][:10] + "..." 

        # Extract Identity Context
        user_id = request.headers.get('X-User-ID', 'anonymous')
        role = request.headers.get('X-Role', 'unknown')
        platform = request.headers.get('X-Platform', 'unknown')
        session_id = request.headers.get('X-Session-ID', None)
        
        # Fallback to JSON payload if headers are missing (common for telemetry)
        if not session_id and request.is_json:
            try:
                session_id = request.get_json().get("session_id")
            except:
                pass

        payload = {
            "method": request.method,
            "token_id": token_id,
            "user_id": user_id,
            "role": role,
            "platform": platform,
            "session_id": session_id
        }
        
        # Route to specific ingestion methods or generic HTTP?
        # The requirement says "Ensure ingest_http_event receives events".
        # So we use ingest_http_event.
        IngestionService.ingest_http_event(payload)

def init_security_logger(app):
    return SecurityLogger(app)

def log_security_event(message, severity="INFO", metadata=None, session_id=None):
    """
    Standalone utility to log security events to the ingestion pipeline.
    """
    # Import inside to avoid circular dependencies
    from backend.services.ingestion_service import IngestionService
    
    print(f"[SECURITY ALERT] {severity}: {message}")
    
    payload = {
        "event_type": "SECURITY_ALERT",
        "message": message,
        "severity": severity,
        "metadata": metadata or {},
        "source": "autonomous_enforcement",
        "session_id": session_id
    }
    
    # We use ingest_http_event as a generic entry point
    try:
        IngestionService.ingest_http_event(payload)
    except Exception as e:
        print(f"Failed to log security event to ingestion service: {e}")
