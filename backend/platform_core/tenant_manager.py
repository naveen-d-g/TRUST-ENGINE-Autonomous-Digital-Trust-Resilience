
from typing import Optional
from threading import local

class TenantContext:
    _local = local()

    @classmethod
    def set_tenant(cls, tenant_id: str):
        cls._local.tenant_id = tenant_id

    @classmethod
    def get_tenant(cls) -> Optional[str]:
        return getattr(cls._local, "tenant_id", "default")

class TenantManager:
    """
    Enforces Multi-Tenant Isolation.
    """
    
    # Mock config store per tenant
    _tenant_configs = {
        "default": {"quota": 1000, "features": ["standard"]},
        "org_Acme": {"quota": 5000, "features": ["premium"]}
    }

    @classmethod
    def get_config(cls) -> dict:
        tid = TenantContext.get_tenant()
        return cls._tenant_configs.get(tid, cls._tenant_configs["default"])
        
    @classmethod
    def enforce_quota(cls, current_usage: int):
        config = cls.get_config()
        if current_usage > config["quota"]:
            raise Exception(f"Quota Exceeded for Tenant {TenantContext.get_tenant()}")
