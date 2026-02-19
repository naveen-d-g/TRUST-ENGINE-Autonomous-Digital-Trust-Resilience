
from typing import Dict, List, Any
import collections

class FairnessMonitor:
    """
    Monitors decision distribution across protected segments (Geo, Device, etc).
    """
    # segment -> decision -> count
    _stats = collections.defaultdict(lambda: collections.defaultdict(int))
    
    @classmethod
    def record_decision(cls, context: Dict[str, Any], decision: str):
        # Extract segments
        geo = context.get("geo_region", "unknown")
        device = context.get("device_type", "unknown")
        
        cls._stats[f"geo:{geo}"][decision] += 1
        cls._stats[f"device:{device}"][decision] += 1
        
    @classmethod
    def check_disparity(cls) -> List[str]:
        """
        Simple check: If reject rate differs by > 20% between groups.
        """
        alerts = []
        # Mock logic implies iterating groups and calculating rates
        # For prototype, we just enable the recording hooks.
        return alerts
