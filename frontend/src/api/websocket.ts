
type WebSocketHandler = (data: unknown) => void;

class SocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private listeners: Set<WebSocketHandler> = new Set();
  private reconnectInterval: number = 5000;

  constructor(url: string) {
    this.url = url;
  }

  connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    this.socket = new WebSocket(this.url);

    this.socket.onopen = () => {
      console.log('✅ SOC Live Stream Connected');
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.notify(data);
      } catch (err) {
        console.error('Failed to parse websocket message', err);
      }
    };

    this.socket.onclose = () => {
      console.warn('⚠ SOC Stream Disconnected. Reconnecting in 5s...');
      setTimeout(() => this.connect(), this.reconnectInterval);
    };
  }

  subscribe(handler: WebSocketHandler) {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  private notify(data: unknown) {
    this.listeners.forEach(handler => handler(data));
  }
}

// Singleton instance pointing to local backend
export const socketClient = new SocketClient('ws://localhost:5000/api/v1/soc/live');
