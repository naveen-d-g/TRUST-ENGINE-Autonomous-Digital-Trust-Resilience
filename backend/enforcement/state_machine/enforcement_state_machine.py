from enum import Enum
from typing import Set

class EnforcementState(str, Enum):
    CREATED = "CREATED"
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    EXECUTING = "EXECUTING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ROLLED_BACK = "ROLLED_BACK"
    EXPIRED = "EXPIRED"

class EnforcementStateMachine:
    """
    Enforces valid state transitions for proposals.
    """
    
    _TRANSITIONS = {
        EnforcementState.CREATED: {EnforcementState.PENDING, EnforcementState.EXPIRED},
        EnforcementState.PENDING: {EnforcementState.APPROVED, EnforcementState.REJECTED, EnforcementState.EXPIRED},
        EnforcementState.APPROVED: {EnforcementState.EXECUTING, EnforcementState.EXPIRED},
        EnforcementState.REJECTED: set(), # Terminal
        EnforcementState.EXECUTING: {EnforcementState.COMPLETED, EnforcementState.FAILED},
        EnforcementState.COMPLETED: {EnforcementState.ROLLED_BACK},
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
