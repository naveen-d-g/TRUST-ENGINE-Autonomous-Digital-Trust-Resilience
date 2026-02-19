from enum import Enum
from typing import Set

class EnforcementState(str, Enum):
    PROPOSED = "PROPOSED"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTING = "EXECUTING"
    EXECUTED = "EXECUTED"
    FAILED = "FAILED"
    ROLLED_BACK = "ROLLED_BACK"
    EXPIRED = "EXPIRED"

class EnforcementStateMachine:
    """
    Enforces valid state transitions for proposals.
    """
    
    _TRANSITIONS = {
        EnforcementState.PROPOSED: {EnforcementState.PENDING_APPROVAL, EnforcementState.EXPIRED},
        EnforcementState.PENDING_APPROVAL: {EnforcementState.APPROVED, EnforcementState.REJECTED, EnforcementState.EXPIRED},
        EnforcementState.APPROVED: {EnforcementState.EXECUTING, EnforcementState.EXPIRED},
        EnforcementState.REJECTED: set(), # Terminal
        EnforcementState.EXECUTING: {EnforcementState.EXECUTED, EnforcementState.FAILED},
        EnforcementState.EXECUTED: {EnforcementState.ROLLED_BACK},
        EnforcementState.FAILED: {EnforcementState.ROLLED_BACK}, # Partial failure might need rollback
        EnforcementState.ROLLED_BACK: set(), # Terminal
        EnforcementState.EXPIRED: set() # Terminal
    }
    
    @classmethod
    def can_transition(cls, current: str, next_state: str) -> bool:
        allowed = cls._TRANSITIONS.get(current, set())
        return next_state in allowed

    @classmethod
    def validate_transition(cls, current: str, next_state: str):
        if not cls.can_transition(current, next_state):
            raise ValueError(f"Illegal State Transition: {current} -> {next_state}")
