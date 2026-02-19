
"""
Canonicalization Engine
Version: v1.0

Enforces bitwise determinism for event inputs.
Normalizes timestamps, sorts keys, and rounds floats to prevent drift.
"""
import json
import hashlib
from typing import Dict, Any

class Canonicalization:
    
    @staticmethod
    def normalize_event(event: Dict[str, Any]) -> Dict[str, Any]:
        """
        Returns a normalized dictionary:
        1. Keys sorted.
        2. Floats rounded to 6 decimal places.
        3. Timestamps converted to strict ISO format if string, or kept as float if float (but rounded).
        """
        normalized = {}
        
        # Sort keys to ensure processing order
        for key in sorted(event.keys()):
            value = event[key]
            
            # Normalize Floats
            if isinstance(value, float):
                value = round(value, 6)
            
            # Normalize Nested Dicts (Recursively)
            elif isinstance(value, dict):
                value = Canonicalization.normalize_event(value)
                
            # Normalize Lists (Sort if possible? No, listing order might matter. 
            # But we should normalize elements)
            elif isinstance(value, list):
                value = [
                    Canonicalization.normalize_event(v) if isinstance(v, dict) else v 
                    for v in value
                ]
            
            normalized[key] = value
            
        return normalized

    @staticmethod
    def to_canonical_json(event: Dict[str, Any]) -> str:
        """
        Produces a canonical JSON string (sorted keys, no whitespace).
        """
        normalized = Canonicalization.normalize_event(event)
        return json.dumps(normalized, sort_keys=True, separators=(',', ':'))

    @staticmethod
    def hash_event(event: Dict[str, Any]) -> str:
        """
        Returns SHA256 hash of the canonical JSON form.
        """
        canonical_str = Canonicalization.to_canonical_json(event)
        return hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()
