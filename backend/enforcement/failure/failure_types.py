from enum import Enum

class EnforcementFailureType(str, Enum):
    ACTION_FAILED = "ACTION_FAILED"           # The action logic itself threw an error
    PARTIAL_EXECUTION = "PARTIAL_EXECUTION"   # Some steps worked, others failed
    ROLLBACK_FAILED = "ROLLBACK_FAILED"       # We tried to undo but couldn't
    TIMEOUT = "TIMEOUT"                       # Execution took too long
    DEPENDENCY_FAILURE = "DEPENDENCY_FAILURE" # External system (Firewall, IDP) down
    GOVERNANCE_REJECTED = "GOVERNANCE_REJECTED" # Policy/Approval blocked it
    SAFE_MODE_BLOCKED = "SAFE_MODE_BLOCKED"   # Global Kill-Switch blocked it
