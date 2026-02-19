from flask import g, request

def get_current_tenant() -> str:
    """Safely retrieves tenant_id from Flask global context."""
    return getattr(g, "tenant_id", "unknown")

def get_request_id() -> str:
    """Safely retrieves request_id from Flask global context."""
    return getattr(g, "request_id", "unknown")
