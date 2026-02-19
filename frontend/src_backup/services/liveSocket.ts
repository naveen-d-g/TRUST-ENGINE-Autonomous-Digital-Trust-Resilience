
import { IncidentSummary, IncidentDetailResponse, SocSummaryResponse } from '../types/soc';

type WebSocketMessage = 
  | { type: 'INCIDENT_CREATED'; payload: IncidentSummary }
  | { type: 'INCIDENT_UPDATED'; payload: IncidentDetailResponse }
  | { type: 'SYSTEM_STATUS'; payload: SocSummaryResponse };

type Listener<T> = (data: T) => void;

class LiveSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectInterval = 3000;
  private listeners: { [key: string]: Listener<unknown>[] } = {};
  private isConnected = false;

  constructor() {
    // But for this environment, we'll assume a proxy or direct URL.
    // Let's hardcode localhost:5000 for dev environment based on known context.
    this.url = 'ws://localhost:5000/api/v1/soc/live?token=dev-api-key&tenant_id=tenant_1'; 
  }

  public connect() {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
            console.log('[SOC-LIVE] Connected');
            this.isConnected = true;
            this.emit('connection_change', true);
        };

        this.socket.onmessage = (event) => {
            try {
                const message: WebSocketMessage = JSON.parse(event.data);
                this.emit(message.type, message.payload);
            } catch (e) {
                console.error('[SOC-LIVE] Parse error', e);
            }
        };

        this.socket.onclose = () => {
            console.log('[SOC-LIVE] Disconnected');
            this.isConnected = false;
            this.emit('connection_change', false);
            setTimeout(() => this.connect(), this.reconnectInterval);
        };

        this.socket.onerror = (err) => {
            console.error('[SOC-LIVE] Error', err);
            this.socket?.close();
        };
    } catch (e) {
        console.error('[SOC-LIVE] Connection failed', e);
        setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  public on<T>(event: string, callback: Listener<T>) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback as Listener<unknown>);
    return () => this.off(event, callback);
  }

  private off<T>(event: string, callback: Listener<T>) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  private emit(event: string, data: unknown) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }

  public get status() {
      return this.isConnected ? 'ONLINE' : 'OFFLINE';
  }
}

export const liveSocket = new LiveSocketService();
