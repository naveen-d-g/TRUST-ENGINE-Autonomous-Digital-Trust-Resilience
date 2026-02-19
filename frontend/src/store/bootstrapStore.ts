import { create } from 'zustand';
import { useAuthStore } from './authStore';
import { useTenantStore } from './tenantStore';
import { socketLifecycleManager } from '../services/socketLifecycle';
import { logger } from '../services/logger';
import { api } from '../services/api';

interface BootstrapState {
  isBootstrapped: boolean;
  isBootstrapping: boolean;
  bootstrapError: string | null;
  
  // Actions
  bootstrap: () => Promise<void>;
  reset: () => void;
}

/**
 * Bootstrap Store
 * Centralized application initialization and data loading orchestration
 */
export const useBootstrapStore = create<BootstrapState>((set, get) => ({
  isBootstrapped: false,
  isBootstrapping: false,
  bootstrapError: null,

  bootstrap: async () => {
    if (get().isBootstrapped || get().isBootstrapping) {
      logger.debug('Bootstrap already completed or in progress');
      return;
    }

    set({ isBootstrapping: true, bootstrapError: null });
    logger.info('Starting application bootstrap');

    try {
      // Step 1: Check and restore auth state
      logger.debug('Bootstrap step 1: Checking auth state');
      useAuthStore.getState().checkAuth();

      const isAuthenticated = useAuthStore.getState().isAuthenticated;

      if (!isAuthenticated) {
        logger.info('User not authenticated, skipping bootstrap');
        set({ isBootstrapped: true, isBootstrapping: false });
        return;
      }

      // Step 2: Fetch user profile (if needed)
      logger.debug('Bootstrap step 2: User profile loaded from auth');

      // Step 3: Load tenant context (if applicable)
      logger.debug('Bootstrap step 3: Loading tenant context');
      try {
        const tenants = await api.get<Array<{ id: string; name: string }>>('/api/tenants');
        if (tenants && tenants.length > 0) {
          // Set first tenant as default if none selected
          if (!useTenantStore.getState().tenantId) {
            useTenantStore.getState().setTenant(tenants[0].id, tenants[0].name);
          }
        }
      } catch (error) {
        logger.warn('Failed to load tenants, continuing without tenant context', { error });
      }

      // Step 4: Initialize WebSocket lifecycle manager
      logger.debug('Bootstrap step 4: Initializing WebSocket lifecycle');
      socketLifecycleManager.initialize();

      // Step 5: Fetch initial dashboard data (optional, can be lazy loaded)
      logger.debug('Bootstrap step 5: Initial data fetch (lazy)');
      // Dashboard will fetch on mount

      // Step 6: Subscribe to real-time events
      logger.debug('Bootstrap step 6: Real-time subscriptions active');
      // Event bus subscriptions are set up in stores

      logger.info('Application bootstrap completed successfully');
      set({ isBootstrapped: true, isBootstrapping: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Bootstrap failed', error as Error);
      set({
        isBootstrapping: false,
        bootstrapError: errorMessage,
      });
      throw error;
    }
  },

  reset: () => {
    set({
      isBootstrapped: false,
      isBootstrapping: false,
      bootstrapError: null,
    });
  },
}));

/**
 * Bootstrap the application
 * Call this once in App.tsx on mount
 */
export async function bootstrapApp() {
  return useBootstrapStore.getState().bootstrap();
}
