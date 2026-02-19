import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { secureStorage } from '../core/security/secureStorage';
import { tokenManager } from '../core/security/tokenManager';
import { api } from '../services/api';
import { socketService } from '../services/socket';
import { logger } from '../services/logger';

export type UserRole = 'ADMIN' | 'ANALYST' | 'VIEWER';

interface User {
  id: string;
  username: string;
  role: UserRole;
  email?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string, user: User, expiresAt: number) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // AUTO-LOGIN: Default to authenticated state to bypass login page
      token: "dev-bypass-token",
      user: {
        id: "admin-bypass",
        username: "admin",
        email: "admin@trustengine.ai",
        role: "ADMIN",
        name: "Admin User"
      },
      isAuthenticated: true,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<{
            token: string;
            user: User;
            expiresAt: number;
          }>('/api/auth/login', { username, password });

          const { token, user, expiresAt } = response;

          // Store token securely
          secureStorage.setItem('auth_token', token);
          secureStorage.setItem('auth_user', user);
          secureStorage.setItem('auth_expires', expiresAt);

          // Set up token expiry monitoring
          tokenManager.setToken({ token, expiresAt });
          tokenManager.startInactivityMonitor();

          // Connect WebSocket
          socketService.connect(token);

          set({
            token,
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          logger.info('User logged in', { username: user.username, role: user.role });
        } catch (error) {
          logger.error('Login failed', error as Error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        const { user } = get();
        
        // Clear token monitoring
        tokenManager.clearToken();

        // Disconnect WebSocket
        socketService.disconnect();

        // Clear secure storage
        secureStorage.removeItem('auth_token');
        secureStorage.removeItem('auth_user');
        secureStorage.removeItem('auth_expires');

        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });

        logger.info('User logged out', { username: user?.username });
      },

      setToken: (token: string, user: User, expiresAt: number) => {
        secureStorage.setItem('auth_token', token);
        secureStorage.setItem('auth_user', user);
        secureStorage.setItem('auth_expires', expiresAt);

        tokenManager.setToken({ token, expiresAt });

        set({
          token,
          user,
          isAuthenticated: true,
        });
      },

      checkAuth: () => {
        const token = secureStorage.getItem<string>('auth_token');
        const user = secureStorage.getItem<User>('auth_user');
        const expiresAt = secureStorage.getItem<number>('auth_expires');

        if (token && user && expiresAt) {
          // Check if token is expired
          if (tokenManager.isTokenExpired(expiresAt)) {
            logger.warn('Token expired, logging out');
            get().logout();
            return;
          }

          // Restore session
          set({
            token,
            user,
            isAuthenticated: true,
          });

          // Set up monitoring
          tokenManager.setToken({ token, expiresAt });
          tokenManager.startInactivityMonitor();

          // Reconnect WebSocket
          socketService.connect(token);

          logger.info('Session restored', { username: user.username });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        // Don't persist sensitive data in regular localStorage
        // We use secureStorage instead
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Initialize API service with auth store getters
api.setTokenGetter(() => useAuthStore.getState().token);
api.setTenantGetter(() => 'tenant_1'); // Default tenant for now
api.setRoleGetter(() => useAuthStore.getState().user?.role || null);
api.setUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

// Set up token manager callback
tokenManager.onLogout(() => useAuthStore.getState().logout());
