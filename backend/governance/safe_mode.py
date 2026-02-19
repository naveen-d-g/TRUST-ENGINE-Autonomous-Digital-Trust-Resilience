from typing import Set

class SafeMode:
    """
    Global Kill-Switch for Enforcement.
    Capabilities:
    - Disable ALL enforcement globally.
    - Disable specific tenants (if needed).
    - Emergency Override (Break Glass).
    """
    
    _GLOBAL_SAFE_MODE = False
    _DISABLED_TENANTS: Set[str] = set()
    
    @classmethod
    def enable_global_safe_mode(cls):
        """Disables ALL enforcement actions."""
        cls._GLOBAL_SAFE_MODE = True
        
    @classmethod
    def disable_global_safe_mode(cls):
        """Re-enables enforcement."""
        cls._GLOBAL_SAFE_MODE = False
        
    @classmethod
    def is_enabled(cls, tenant_id: str = None) -> bool:
        """
        Returns True if enforcement should be SKIPPED.
        """
        if cls._GLOBAL_SAFE_MODE:
            return True
        if tenant_id and tenant_id in cls._DISABLED_TENANTS:
            return True
        return False
        
    @classmethod
    def disable_tenant(cls, tenant_id: str):
        cls._DISABLED_TENANTS.add(tenant_id)
        
    @classmethod
    def enable_tenant(cls, tenant_id: str):
        cls._DISABLED_TENANTS.discard(tenant_id)
