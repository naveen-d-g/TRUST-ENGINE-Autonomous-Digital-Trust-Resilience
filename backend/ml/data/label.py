
from enum import Enum
from typing import Optional

class LabelSource(Enum):
    RULE = "rule"
    ANALYST = "analyst"
    OUTCOME = "outcome"

class RiskLabel(int):
    BENIGN = 0
    SUSPICIOUS = 1
    HIGH_RISK = 2
    MALICIOUS = 3

def resolve_label(rule_label: int, analyst_label: Optional[int] = None, outcome_label: Optional[int] = None) -> int:
    """
    Resolves the label based on source priority:
    OUTCOME (Ground Truth) > ANALYST (Expert) > RULE (Heuristic).
    
    Returns standard RiskLabel integer (0-3).
    """
    if outcome_label is not None:
        return outcome_label
    if analyst_label is not None:
        return analyst_label
    return rule_label
