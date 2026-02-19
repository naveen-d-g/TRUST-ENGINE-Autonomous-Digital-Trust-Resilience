import { io, Socket } from 'socket.io-client';
import { runtimeConfig } from '../config/runtimeConfig';
import { logger } from './logger';
import { eventBus } from './eventBus';

/**
 * WebSocket service with auto-reconnect and heartbeat
 */
class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  private isConnected = false;

  /**
   * Connect to WebSocket server
   */
  connect(token?: string) {
    if (this.socket?.connected) {
      logger.debug('WebSocket already connected');
      return;
    }

    logger.info('Connecting to WebSocket', { url: runtimeConfig.websocket.url });

    this.socket = io(runtimeConfig.websocket.url, {
      auth: token ? { token } : undefined,
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: runtimeConfig.websocket.reconnectAttempts,
      reconnectionDelay: runtimeConfig.websocket.reconnectDelay,
    });

    this.setupEventHandlers();
    this.startHeartbeat();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect() {
    if (this.socket) {
      logger.info('Disconnecting from WebSocket');
      this.stopHeartbeat();
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if connected
   */
  connected(): boolean {
    return this.isConnected;
  }

  /**
   * Emit event to server
   */
  emit(event: string, data: unknown) {
    if (!this.socket?.connected) {
      logger.warn('Cannot emit, WebSocket not connected', { event });
      return;
    }
    this.socket.emit(event, data);
  }

  /**
   * Subscribe to event (for legacy code compatibility)
   */
  on(event: string, handler: (data: any) => void) {
    if (!this.socket) {
      logger.warn('Cannot subscribe, WebSocket not initialized', { event });
      return;
    }
    this.socket.on(event, handler);
  }

  /**
   * Unsubscribe from event (for legacy code compatibility)
   */
  off(event: string, handler?: (data: any) => void) {
    if (!this.socket) {
      logger.warn('Cannot unsubscribe, WebSocket not initialized', { event });
      return;
    }
    if (handler) {
      this.socket.off(event, handler);
    } else {
      this.socket.off(event);
    }
  }

  /**
   * Get socket instance (for DevOverlay and debugging)
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info('WebSocket connected');
      eventBus.emit('notification', {
        message: 'Connected to real-time updates',
        severity: 'success',
      });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      logger.warn('WebSocket disconnected', { reason });
      eventBus.emit('notification', {
        message: 'Disconnected from real-time updates',
        severity: 'warning',
      });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      logger.error('WebSocket connection error', error, {
        attempt: this.reconnectAttempts,
      });

      if (this.reconnectAttempts >= runtimeConfig.websocket.reconnectAttempts) {
        eventBus.emit('notification', {
          message: 'Failed to connect to real-time updates',
          severity: 'error',
        });
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      logger.info('WebSocket reconnected', { attemptNumber });
      eventBus.emit('notification', {
        message: 'Reconnected to real-time updates',
        severity: 'success',
      });
    });

    // Route all events to event bus
    this.socket.onAny((event, data) => {
      logger.debug('WebSocket event received', { event, data });
      
      // Route to event bus based on event name
      if (event.startsWith('incident:')) {
        eventBus.emit(event as any, data);
      } else if (event.startsWith('session:')) {
        eventBus.emit(event as any, data);
      } else if (event.startsWith('metric:')) {
        eventBus.emit(event as any, data);
      } else if (event.startsWith('batch:')) {
        eventBus.emit(event as any, data);
      } else if (event === 'batch_progress') {
        eventBus.emit('batch:progress' as any, data);
      } else if (event === 'batch_completed') {
         eventBus.emit('batch:completed' as any, data);
      } else if (event === 'batch_failed') {
         eventBus.emit('batch:failed' as any, data);
      } else if (event === 'notification') {
        eventBus.emit('notification', data);
      }
    });
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('ping');
      }
    }, runtimeConfig.websocket.heartbeatInterval);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
}

export const socketService = new SocketService();
