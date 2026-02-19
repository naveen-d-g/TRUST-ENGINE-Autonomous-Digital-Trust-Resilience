from enum import IntEnum

class Label(IntEnum):
    """
    Target Labels for Training and Risk classification.
    """
    BENIGN = 0
    SUSPICIOUS = 1
    HIGH_RISK = 2
    MALICIOUS = 3

class LabelSource(IntEnum):
    """
    Priority of the label source.
    """
    RULE = 1    # Heuristic / Rule-based
    ANALYST = 2 # Human expert (Highest Priority usually, or specialized override)
    OUTCOME = 3 # Verified outcome (e.g. chargeback, confirmed breach) - GOLD TRUTH
