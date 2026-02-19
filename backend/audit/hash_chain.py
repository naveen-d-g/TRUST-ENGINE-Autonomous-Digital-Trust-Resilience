import hashlib
import json

def compute_canonical_hash(event_dict: dict) -> str:
    """
    Computes a SHA-256 hash for a payload, ensuring canonical JSON representation.
    """
    canonical = json.dumps(event_dict, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical.encode()).hexdigest()

def compute_hash(previous_hash: str, payload: dict) -> str:
    """
    Legacy helper for chained audit hashing.
    """
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    base = f"{previous_hash}|{canonical}".encode()
    return hashlib.sha256(base).hexdigest()
