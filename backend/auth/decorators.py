from flask import g, abort
from functools import wraps
from backend.contracts.enums import Role

def require_access(*, roles=None, role=None, platform=None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            ctx = getattr(g, 'auth', None)
            if not ctx:
                abort(401)
            
            # Support both single 'role' and list 'roles'
            allowed_roles = roles if roles else ([role] if role else [])
            
            # SOC Hierarchy: ADMIN > ANALYST > VIEWER
            if ctx.role == Role.ADMIN:
                effective_roles = {Role.ADMIN, Role.ANALYST, Role.VIEWER}
            elif ctx.role == Role.ANALYST:
                effective_roles = {Role.ANALYST, Role.VIEWER}
            else:
                effective_roles = {ctx.role}
            
            if allowed_roles and not any(r in effective_roles for r in allowed_roles):
                abort(403)
            
            if platform and ctx.platform != platform:
                abort(403)
                
            return fn(*args, **kwargs)
        return wrapper
    return decorator
