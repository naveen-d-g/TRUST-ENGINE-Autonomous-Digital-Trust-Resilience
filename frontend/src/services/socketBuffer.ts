import { runtimeConfig } from '../config/runtimeConfig';

/**
 * WebSocket event buffer for throttling and batching updates
 * Prevents dashboard re-render flooding
 */

interface BufferedEvent {
  type: string;
  data: unknown;
  timestamp: number;
}

class SocketBuffer {
  private buffer: Map<string, BufferedEvent[]> = new Map();
  private flushTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private callbacks: Map<string, ((events: BufferedEvent[]) => void)[]> = new Map();

  /**
   * Subscribe to buffered events of a specific type
   */
  subscribe(eventType: string, callback: (events: BufferedEvent[]) => void) {
    if (!this.callbacks.has(eventType)) {
      this.callbacks.set(eventType, []);
    }
    this.callbacks.get(eventType)!.push(callback);

    return () => {
      const callbacks = this.callbacks.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  /**
   * Add event to buffer
   */
  add(eventType: string, data: unknown) {
    if (!this.buffer.has(eventType)) {
      this.buffer.set(eventType, []);
    }

    this.buffer.get(eventType)!.push({
      type: eventType,
      data,
      timestamp: Date.now(),
    });

    // Schedule flush if not already scheduled
    if (!this.flushTimers.has(eventType)) {
      this.scheduleFlush(eventType);
    }
  }

  private scheduleFlush(eventType: string) {
    const timer = setTimeout(() => {
      this.flush(eventType);
    }, runtimeConfig.performance.websocketBufferDelay);

    this.flushTimers.set(eventType, timer);
  }

  private flush(eventType: string) {
    const events = this.buffer.get(eventType);
    if (!events || events.length === 0) {
      this.flushTimers.delete(eventType);
      return;
    }

    // Use requestAnimationFrame for smooth UI updates
    requestAnimationFrame(() => {
      const callbacks = this.callbacks.get(eventType);
      if (callbacks) {
        callbacks.forEach(callback => {
          try {
            callback([...events]);
          } catch (error) {
            console.error(`Error in socket buffer callback for ${eventType}:`, error);
          }
        });
      }

      // Clear buffer and timer
      this.buffer.set(eventType, []);
      this.flushTimers.delete(eventType);
    });
  }

  /**
   * Force flush all buffers immediately
   */
  flushAll() {
    this.buffer.forEach((_, eventType) => {
      const timer = this.flushTimers.get(eventType);
      if (timer) {
        clearTimeout(timer);
      }
      this.flush(eventType);
    });
  }

  /**
   * Clear all buffers
   */
  clear() {
    this.flushTimers.forEach(timer => clearTimeout(timer));
    this.buffer.clear();
    this.flushTimers.clear();
  }
}

export const socketBuffer = new SocketBuffer();
