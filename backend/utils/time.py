from datetime import datetime, timezone

def utc_now() -> datetime:
    """Standardized UTC Now."""
    return datetime.now(timezone.utc)

def iso_now() -> str:
    """ISO 8601 String in UTC."""
    return utc_now().isoformat()
