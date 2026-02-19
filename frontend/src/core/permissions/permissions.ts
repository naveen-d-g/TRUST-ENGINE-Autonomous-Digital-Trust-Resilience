/**
 * Permission definitions and role mappings
 * Defines all permissions in the system and which roles have them
 */

export const Permissions = {
  // Incident permissions
  VIEW_INCIDENTS: 'VIEW_INCIDENTS',
  CREATE_INCIDENT: 'CREATE_INCIDENT',
  UPDATE_INCIDENT: 'UPDATE_INCIDENT',
  DELETE_INCIDENT: 'DELETE_INCIDENT',
  
  // Action permissions
  CONTAIN: 'CONTAIN',
  RECOVER: 'RECOVER',
  APPROVE_PROPOSAL: 'APPROVE_PROPOSAL',
  
  // Session permissions
  VIEW_SESSIONS: 'VIEW_SESSIONS',
  VIEW_SESSION_DETAILS: 'VIEW_SESSION_DETAILS',
  REPLAY_SESSION: 'REPLAY_SESSION',
  TERMINATE_SESSION: 'TERMINATE_SESSION',
  
  // Admin permissions
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  VIEW_AUDIT_LOGS: 'VIEW_AUDIT_LOGS',
  
  // Simulation permissions
  RUN_SIMULATION: 'RUN_SIMULATION',
  VIEW_SIMULATION: 'VIEW_SIMULATION',
  
  // Batch permissions
  BATCH_AUDIT: 'BATCH_AUDIT',
  
  // System permissions
  VIEW_SYSTEM_HEALTH: 'VIEW_SYSTEM_HEALTH',
  CONFIGURE_SYSTEM: 'CONFIGURE_SYSTEM',
} as const;

export type Permission = typeof Permissions[keyof typeof Permissions];

/**
 * Role to permissions mapping
 */
export const RolePermissions: Record<string, Permission[]> = {
  ADMIN: Object.values(Permissions), // Admin has all permissions
  
  ANALYST: [
    Permissions.VIEW_INCIDENTS,
    Permissions.CREATE_INCIDENT,
    Permissions.UPDATE_INCIDENT,
    Permissions.CONTAIN,
    Permissions.VIEW_SESSIONS,
    Permissions.VIEW_SESSION_DETAILS,
    Permissions.REPLAY_SESSION,
    Permissions.TERMINATE_SESSION,
    Permissions.VIEW_SIMULATION,
    Permissions.RUN_SIMULATION,
    Permissions.BATCH_AUDIT,
    Permissions.VIEW_SYSTEM_HEALTH,
  ],
  
  VIEWER: [
    Permissions.VIEW_INCIDENTS,
    Permissions.VIEW_SESSIONS,
    Permissions.VIEW_SESSION_DETAILS,
    Permissions.VIEW_SIMULATION,
    Permissions.VIEW_SYSTEM_HEALTH,
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = RolePermissions[role] || [];
  return permissions.includes(permission);
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(role, permission));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: string, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(role, permission));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: string): Permission[] {
  return RolePermissions[role] || [];
}
