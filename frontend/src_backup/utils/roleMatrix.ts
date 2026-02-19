import { UserRole } from '../types/auth';

export const RoleMatrix = {
  VIEWER: {
    canViewDashboard: false, // Redirects to Home
    canViewDemo: true,
    canViewIncidents: false,
    canApprove: false,
    canRecover: false,
    canAdmin: false,
  },
  ANALYST: {
    canViewDashboard: true,
    canViewDemo: false,
    canViewIncidents: true,
    canApprove: true, // Proposals
    canRecover: false,
    canAdmin: false,
  },
  ADMIN: {
    canViewDashboard: true,
    canViewDemo: false,
    canViewIncidents: true,
    canApprove: true,
    canRecover: true,
    canAdmin: true,
  }
};

export const hasPermission = (role: UserRole, permission: keyof typeof RoleMatrix['ADMIN']) => {
    const roleKey = role.toUpperCase() as keyof typeof RoleMatrix;
    return RoleMatrix[roleKey]?.[permission] || false;
};
