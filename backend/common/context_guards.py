from backend.orchestration.execution_context import ExecutionContext

class StaleContextError(Exception):
    pass

class ContextGuards:
    """
    Universal Freshness Enforcement.
    """
    
    @staticmethod
    def ensure_context_fresh(context: ExecutionContext):
        """
        Validates that the execution context is still within its TTL.
        Raises StaleContextError if expired.
        """
        if context.is_expired():
            raise StaleContextError(f"Context {context.session_id} is STALE. Action rejected.")
