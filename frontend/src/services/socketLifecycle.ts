import { socketService } from './socket';
import { useAuthStore } from '../store/authStore';
import { useTenantStore } from '../store/tenantStore';
import { logger } from './logger';

/**
 * WebSocket Lifecycle Manager
 * Handles connection/disconnection based on auth and tenant state
 */
class SocketLifecycleManager {
  private isInitialized = false;

  /**
   * Initialize WebSocket lifecycle management
   * Sets up listeners for auth and tenant changes
   */
  initialize() {
    if (this.isInitialized) {
      logger.warn('Socket lifecycle already initialized');
      return;
    }

    // Subscribe to auth store changes
    useAuthStore.subscribe((state, prevState) => {
      // On login
      if (state.isAuthenticated && !prevState.isAuthenticated && state.token) {
        logger.info('User logged in, connecting WebSocket');
        this.connect(state.token);
      }

      // On logout
      if (!state.isAuthenticated && prevState.isAuthenticated) {
        logger.info('User logged out, disconnecting WebSocket');
        this.disconnect();
      }
    });

    // Subscribe to tenant store changes
    useTenantStore.subscribe((state, prevState) => {
      // On tenant change (only if authenticated)
      if (
        state.tenantId !== prevState.tenantId &&
        state.tenantId &&
        useAuthStore.getState().isAuthenticated
      ) {
        logger.info('Tenant changed, reconnecting WebSocket', {
          from: prevState.tenantId,
          to: state.tenantId,
        });
        this.reconnectWithTenant(state.tenantId);
      }
    });

    this.isInitialized = true;
    logger.info('Socket lifecycle manager initialized');
  }

  /**
   * Connect WebSocket with token
   */
  private connect(token: string) {
    socketService.connect(token);
  }

  /**
   * Disconnect WebSocket
   */
  private disconnect() {
    socketService.disconnect();
  }

  /**
   * Reconnect WebSocket with new tenant context
   */
  private reconnectWithTenant(tenantId: string) {
    const token = useAuthStore.getState().token;
    if (!token) {
      logger.warn('Cannot reconnect: no token available');
      return;
    }

    // Disconnect and reconnect to refresh tenant context
    socketService.disconnect();
    
    // Small delay to ensure clean disconnect
    setTimeout(() => {
      socketService.connect(token);
    }, 100);
  }

  /**
   * Manually trigger reconnection
   */
  reconnect() {
    const token = useAuthStore.getState().token;
    if (!token) {
      logger.warn('Cannot reconnect: not authenticated');
      return;
    }

    logger.info('Manual WebSocket reconnection triggered');
    this.disconnect();
    setTimeout(() => {
      this.connect(token);
    }, 100);
  }
}

export const socketLifecycleManager = new SocketLifecycleManager();
