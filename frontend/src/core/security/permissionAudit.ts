import { logger } from '../../services/logger';

interface PermissionCheck {
  permission: string;
  granted: boolean;
  role: string;
  timestamp: number;
}

/**
 * Permission audit trail
 * Logs all permission evaluations for security auditing
 */
class PermissionAuditor {
  private checks: PermissionCheck[] = [];
  private maxChecks = 1000;

  logCheck(permission: string, granted: boolean, role: string) {
    const check: PermissionCheck = {
      permission,
      granted,
      role,
      timestamp: Date.now(),
    };

    this.checks.push(check);

    // Keep only recent checks
    if (this.checks.length > this.maxChecks) {
      this.checks = this.checks.slice(-this.maxChecks);
    }

    // Log denied permissions
    if (!granted) {
      logger.warn('Permission denied', {
        permission,
        role,
      });
    }
  }

  getRecentChecks(count = 100): PermissionCheck[] {
    return this.checks.slice(-count);
  }

  getDeniedChecks(): PermissionCheck[] {
    return this.checks.filter(check => !check.granted);
  }

  clear() {
    this.checks = [];
  }
}

export const permissionAuditor = new PermissionAuditor();
