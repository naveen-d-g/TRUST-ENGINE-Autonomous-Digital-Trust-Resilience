import { runtimeConfig } from '../../config/runtimeConfig';
import { logger } from '../../services/logger';

interface TokenData {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

type LogoutCallback = () => void;

class TokenManager {
  private logoutCallbacks: LogoutCallback[] = [];
  private expiryTimer: NodeJS.Timeout | null = null;
  private inactivityTimer: NodeJS.Timeout | null = null;

  /**
   * Register a callback to be called on auto-logout
   */
  onLogout(callback: LogoutCallback) {
    this.logoutCallbacks.push(callback);
    return () => {
      this.logoutCallbacks = this.logoutCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Set token and start expiry monitoring
   */
  setToken(tokenData: TokenData) {
    this.clearTimers();

    const now = Date.now();
    const timeUntilExpiry = tokenData.expiresAt - now;

    if (timeUntilExpiry <= 0) {
      logger.warn('Token is already expired');
      this.triggerLogout();
      return;
    }

    // Set timer to auto-logout before token expires
    const logoutTime = timeUntilExpiry - runtimeConfig.security.tokenRefreshThreshold;
    
    if (logoutTime > 0) {
      this.expiryTimer = setTimeout(() => {
        logger.info('Token expiring soon, logging out');
        this.triggerLogout();
      }, logoutTime);
    }

    logger.debug('Token expiry timer set', {
      expiresIn: Math.floor(timeUntilExpiry / 1000) + 's',
    });
  }

  /**
   * Start inactivity monitoring
   */
  startInactivityMonitor() {
    this.resetInactivityTimer();

    // Reset timer on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, this.resetInactivityTimer);
    });
  }

  private resetInactivityTimer = () => {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
    }

    this.inactivityTimer = setTimeout(() => {
      logger.info('User inactive, logging out');
      this.triggerLogout();
    }, runtimeConfig.security.autoLogoutDelay);
  };

  /**
   * Clear token and stop monitoring
   */
  clearToken() {
    this.clearTimers();
  }

  private clearTimers() {
    if (this.expiryTimer) {
      clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  private triggerLogout() {
    this.clearTimers();
    this.logoutCallbacks.forEach(callback => callback());
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }

  /**
   * Check if token needs refresh
   */
  needsRefresh(expiresAt: number): boolean {
    const timeUntilExpiry = expiresAt - Date.now();
    return timeUntilExpiry <= runtimeConfig.security.tokenRefreshThreshold;
  }
}

export const tokenManager = new TokenManager();
