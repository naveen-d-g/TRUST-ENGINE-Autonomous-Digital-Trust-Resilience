import { SessionDTO, IncidentDTO } from './dto';

/**
 * Type-safe WebSocket event definitions
 * No string literals allowed in socket handlers
 */

export type SocketEvent =
  | SessionUpdateEvent
  | IncidentNewEvent
  | IncidentUpdateEvent
  | MetricUpdateEvent
  | NotificationEvent
  | ConnectionEvent;

export interface SessionUpdateEvent {
  type: 'SESSION_UPDATE';
  payload: SessionDTO;
}

export interface IncidentNewEvent {
  type: 'INCIDENT_NEW';
  payload: IncidentDTO;
}

export interface IncidentUpdateEvent {
  type: 'INCIDENT_UPDATE';
  payload: IncidentDTO;
}

export interface MetricUpdateEvent {
  type: 'METRIC_UPDATE';
  payload: {
    metric_name: string;
    value: number;
    timestamp: string;
  };
}

export interface NotificationEvent {
  type: 'NOTIFICATION';
  payload: {
    message: string;
    severity: string;
    timestamp: string;
  };
}

export interface ConnectionEvent {
  type: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTED';
  payload?: {
    message?: string;
  };
}

/**
 * Type guard for socket events
 */
export function isSocketEvent(event: unknown): event is SocketEvent {
  if (!event || typeof event !== 'object') return false;
  
  const obj = event as Record<string, unknown>;
  
  return (
    typeof obj.type === 'string' &&
    obj.payload !== undefined
  );
}

/**
 * Event type constants for type safety
 */
export const SocketEventTypes = {
  SESSION_UPDATE: 'SESSION_UPDATE',
  INCIDENT_NEW: 'INCIDENT_NEW',
  INCIDENT_UPDATE: 'INCIDENT_UPDATE',
  METRIC_UPDATE: 'METRIC_UPDATE',
  NOTIFICATION: 'NOTIFICATION',
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  RECONNECTED: 'RECONNECTED',
} as const;
