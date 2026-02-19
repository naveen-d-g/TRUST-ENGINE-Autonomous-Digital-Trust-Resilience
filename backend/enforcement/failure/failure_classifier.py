from typing import Any, Optional
from backend.enforcement.failure.failure_types import EnforcementFailureType

class EnforcementFailureClassifier:
    """
    Classifies raw exceptions or results into structured SOC Failure Types.
    """
    
    @staticmethod
    def classify_exception(e: Exception) -> EnforcementFailureType:
        error_msg = str(e).lower()
        
        if isinstance(e, TimeoutError) or "timeout" in error_msg:
            return EnforcementFailureType.TIMEOUT
        if isinstance(e, ConnectionError) or "connection" in error_msg or "network" in error_msg or "connect" in error_msg:
            return EnforcementFailureType.DEPENDENCY_FAILURE
        if "rollback" in error_msg:
            return EnforcementFailureType.ROLLBACK_FAILED
            
        return EnforcementFailureType.ACTION_FAILED

    @staticmethod
    def classify_result(success: bool, meta: Optional[dict] = None) -> Optional[EnforcementFailureType]:
        if success:
            return None
            
        if meta and meta.get("partial", False):
            return EnforcementFailureType.PARTIAL_EXECUTION
            
        return EnforcementFailureType.ACTION_FAILED
