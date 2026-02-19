
from dataclasses import dataclass
from typing import Dict

@dataclass
class Recommendation:
    action: str # "RETRAIN_MODEL", "ADJUST_THRESHOLD"
    target: str # "AuthModel_v1", "web_allow_threshold"
    reason: str
    priority: str # "HIGH", "MEDIUM", "LOW"
    expected_gain: str
    
    # INVARIANT: Must NOT be auto-executable by default in code.
    # It enters a queue.

    def to_dict(self) -> Dict:
        return {
            "action": self.action,
            "target": self.target,
            "reason": self.reason,
            "priority": self.priority,
            "expected_gain": self.expected_gain
        }
