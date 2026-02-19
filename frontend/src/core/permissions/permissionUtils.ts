import { useAuthStore } from '../../store/authStore';
import { hasPermission, Permission } from '../permissions/permissions';

/**
 * Check if current user has a specific permission
 * Non-hook version for use outside components
 */
export function can(permission: Permission): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return hasPermission(user.role, permission);
}

/**
 * Check if current user has any of the specified permissions
 */
export function canAny(permissions: Permission[]): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return permissions.some(permission => hasPermission(user.role, permission));
}

/**
 * Check if current user has all of the specified permissions
 */
export function canAll(permissions: Permission[]): boolean {
  const user = useAuthStore.getState().user;
  if (!user) return false;
  return permissions.every(permission => hasPermission(user.role, permission));
}

/**
 * Get current user role
 */
export function getCurrentRole(): string | null {
  const user = useAuthStore.getState().user;
  return user?.role || null;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const user = useAuthStore.getState().user;
  return user?.role === 'ADMIN';
}

/**
 * Check if user is analyst or admin
 */
export function isAnalystOrAdmin(): boolean {
  const user = useAuthStore.getState().user;
  return user?.role === 'ANALYST' || user?.role === 'ADMIN';
}
