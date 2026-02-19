/**
 * CSRF Protection utilities
 * Handles CSRF token management for secure requests
 */

let csrfToken: string | null = null;

export const csrfProtection = {
  /**
   * Set CSRF token (typically received from backend on login)
   */
  setToken(token: string) {
    csrfToken = token;
  },

  /**
   * Get current CSRF token
   */
  getToken(): string | null {
    return csrfToken;
  },

  /**
   * Clear CSRF token
   */
  clearToken() {
    csrfToken = null;
  },

  /**
   * Get headers object with CSRF token
   */
  getHeaders(): Record<string, string> {
    if (!csrfToken) return {};
    return {
      'X-CSRF-Token': csrfToken,
    };
  },
};
