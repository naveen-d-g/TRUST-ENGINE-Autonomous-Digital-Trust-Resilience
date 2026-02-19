from dataclasses import dataclass
from backend.contracts.enums import Role, Platform

@dataclass
class AuthContext:
    user_id: str
    role: Role
    platform: Platform
    tenant_id: str
    api_key_id: str
