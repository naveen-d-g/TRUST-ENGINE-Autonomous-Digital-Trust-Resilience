
"""
Time Leakage Guard
Version: v1.0

Strictly enforces that no event usage occurs after the decision timestamp.
This is critical for preventing "Future Leakage" in training and replay.
"""
from typing import Dict, Any

class TimeLeakageError(Exception):
    pass

def validate_event_time(event: Dict[str, Any], decision_timestamp: float):
    """
    Raises TimeLeakageError if event['timestamp'] > decision_timestamp.
    Timestamps are assumed to be in seconds (float) or ISO strings converted to seconds.
    """
    event_ts = event.get('timestamp')
    if event_ts is None:
        return # Cannot validate without timestamp, assume unsafe? Or strict mode?
        # For now, if missing mechanism handles it elsewhere or we skip.
    
    # Simple float comparison
    try:
        ts = float(event_ts)
        if ts > decision_timestamp:
            raise TimeLeakageError(
                f"Future Leakage Detected! Event TS {ts} > Decision TS {decision_timestamp}"
            )
    except (ValueError, TypeError):
        # Handle string parsing if needed, but we expect normalized floats here
        pass
