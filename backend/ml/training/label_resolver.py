
"""
Label Resolver (Strict Priority)
Version: v1.0

This module resolves conflicting labels according to a strict priority hierarchy.
Priority:
1. OUTCOME (Highest) - Confirmed by real-world result (e.g., chargeback, confirmed hack)
2. ANALYST - Manually applied by SOC team
3. RULE - Derived from deterministic rules (Lowest)

Labels:
0: BENIGN
1: SUSPICIOUS
2: MALICIOUS
"""
from typing import Optional, Dict

class LabelResolver:
    PRIORITY = {
        "OUTCOME": 3,
        "ANALYST": 2,
        "RULE": 1,
        "NONE": 0
    }
    
    LABEL_MAP = {
        "BENIGN": 0,
        "SUSPICIOUS": 1,
        "MALICIOUS": 2
    }

    @staticmethod
    def resolve_label(outcome_label: Optional[str] = None, 
                      analyst_label: Optional[str] = None, 
                      rule_label: Optional[str] = None) -> int:
        """
        Resolves the final label based on strict priority.
        Inputs should be "BENIGN", "SUSPICIOUS", "MALICIOUS" or None.
        Returns integer label (0, 1, 2).
        """
        
        # 1. Outcome (Highest Priority)
        if outcome_label and outcome_label in LabelResolver.LABEL_MAP:
            return LabelResolver.LABEL_MAP[outcome_label]
            
        # 2. Analyst
        if analyst_label and analyst_label in LabelResolver.LABEL_MAP:
             return LabelResolver.LABEL_MAP[analyst_label]
             
        # 3. Rule
        if rule_label and rule_label in LabelResolver.LABEL_MAP:
             return LabelResolver.LABEL_MAP[rule_label]
             
        # Default to SUSPICIOUS if no label? Or BENIGN?
        # Master Prompt says "No future data leakage", implying we must have a label to train.
        # If no label exists, this sample should likely be discarded or marked BENIGN (0).
        # Let's default to BENIGN (0) for safety in this contract.
        return 0

    @staticmethod
    def validate_label(label: int) -> bool:
        return label in [0, 1, 2]
