from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, List

@dataclass(frozen=True)
class SessionSnapshot:
    """
    Immutable Snapshot for ML Inference.
    🔴 BLOCKER 2 – SessionStateEngine as HARD ML Gateway
    """
    session_id: str
    features: Dict[str, Any]
    events: List[Dict[str, Any]] # 🔴 Added for ML extraction compatibility
    window_start: datetime
    window_end: datetime
