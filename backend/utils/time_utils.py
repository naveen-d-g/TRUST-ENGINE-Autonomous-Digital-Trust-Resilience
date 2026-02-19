from datetime import datetime, timezone

def utc_now():
    """Returns current UTC time."""
    return datetime.now(timezone.utc)

def iso_now():
    """Returns current UTC time in ISO 8601 format."""
    return utc_now().isoformat()

def parse_iso(iso_str: str) -> datetime:
    """Parses ISO string to datetime."""
    return datetime.fromisoformat(iso_str.replace("Z", "+00:00"))
