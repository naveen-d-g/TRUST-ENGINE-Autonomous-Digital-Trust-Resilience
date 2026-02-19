import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { hasPermission, hasAnyPermission, Permission } from '../permissions/permissions';
import { permissionAuditor } from '../security/permissionAudit';

/**
 * Route guard - requires authentication
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Route guard - requires specific permission
 */
export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const granted = hasPermission(user.role, permission);
  
  // Audit permission check
  permissionAuditor.logCheck(permission, granted, user.role);

  if (!granted) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * Route guard - requires any of the specified permissions
 */
export function RequireAnyPermission({
  permissions,
  children,
  fallback,
}: {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const granted = hasAnyPermission(user.role, permissions);

  if (!granted) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

/**
 * Component guard - conditionally renders based on permission
 */
export function Can({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return fallback ? <>{fallback}</> : null;
  }

  const granted = hasPermission(user.role, permission);
  
  // Audit permission check
  permissionAuditor.logCheck(permission, granted, user.role);

  if (!granted) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

/**
 * Hook to check permissions
 */
export function usePermission(permission: Permission): boolean {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return false;
  
  return hasPermission(user.role, permission);
}

/**
 * Hook to check any permissions
 */
export function useAnyPermission(permissions: Permission[]): boolean {
  const user = useAuthStore((state) => state.user);
  
  if (!user) return false;
  
  return hasAnyPermission(user.role, permissions);
}
