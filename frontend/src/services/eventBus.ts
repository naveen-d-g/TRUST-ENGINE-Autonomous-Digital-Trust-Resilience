/**
 * Type-safe event bus for cross-component communication
 * Implements pub/sub pattern with automatic cleanup
 */

type EventListener<T = unknown> = (data: T) => void;

interface EventMap {
  // Real-time events
  'incident:new': { id: string; severity: string; title: string };
  'incident:updated': { id: string; status: string };
  'session:updated': { sessionId: string; riskScore: number };
  'metric:updated': { type: string; value: number };
  'notification': { message: string; severity: string };
  
  // UI events
  'theme:changed': { theme: 'dark' | 'light' };
  'tenant:changed': { tenantId: string };
  'auth:logout': void;
  
  // Generic fallback
  [key: string]: unknown;
}

class EventBus {
  private listeners: Map<string, Set<EventListener>> = new Map();
  private eventHistory: Array<{ event: string; data: unknown; timestamp: number }> = [];
  private maxHistorySize = 100;

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventMap>(event: K, callback: EventListener<EventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    this.listeners.get(event)!.add(callback as EventListener);

    // Return unsubscribe function
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof EventMap>(event: K, callback: EventListener<EventMap[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback as EventListener);
    }
  }

  /**
   * Emit an event
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    // Add to history
    this.eventHistory.push({
      event: event as string,
      data,
      timestamp: Date.now(),
    });

    // Keep history size limited
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistorySize);
    }

    // Notify all listeners
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Get recent event history
   */
  getHistory(count = 20): Array<{ event: string; data: unknown; timestamp: number }> {
    return this.eventHistory.slice(-count);
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
    this.eventHistory = [];
  }

  /**
   * Get listener count for debugging
   */
  getListenerCount(event?: string): number {
    if (event) {
      return this.listeners.get(event)?.size || 0;
    }
    let total = 0;
    this.listeners.forEach(set => {
      total += set.size;
    });
    return total;
  }
}

export const eventBus = new EventBus();
