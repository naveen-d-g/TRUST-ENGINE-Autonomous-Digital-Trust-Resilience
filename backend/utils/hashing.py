import hashlib
import json
from typing import Dict, Any

def compute_canonical_hash(event_id: str, session_id: str, payload: Dict[str, Any], timestamp: str) -> str:
    """
    Computes SHA256 canonical hash for event integrity.
    Structure: event_id|session_id|timestamp|sorted_payload
    """
    # 1. Sort Payload for Determinism
    payload_str = json.dumps(payload, sort_keys=True)
    
    # 2. Concat
    data_str = f"{event_id}|{session_id}|{timestamp}|{payload_str}"
    
    # 3. Hash
    return hashlib.sha256(data_str.encode()).hexdigest()

def compute_chain_hash(prev_hash: str, current_data: str) -> str:
    """Computes immutable chain hash."""
    return hashlib.sha256(f"{prev_hash}|{current_data}".encode()).hexdigest()
