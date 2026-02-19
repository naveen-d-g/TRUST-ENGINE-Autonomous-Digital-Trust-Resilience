import uuid
from flask import request, g

def request_id_middleware(app):
    @app.before_request
    def add_request_id():
        """
        Reads or generates Request ID.
        """
        req_id = request.headers.get("X-Request-ID")
        if not req_id:
            req_id = str(uuid.uuid4())
        
        g.request_id = req_id

    @app.after_request
    def attach_request_id(response):
        """
        Attaches Request ID to response headers.
        """
        # Ensure g.request_id exists even if before_request failed (unlikely for first middleware)
        req_id = getattr(g, "request_id", "unknown")
        response.headers["X-Request-ID"] = req_id
        return response
