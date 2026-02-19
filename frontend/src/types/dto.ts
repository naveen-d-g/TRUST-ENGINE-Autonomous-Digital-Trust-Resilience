/**
 * Backend DTO (Data Transfer Object) types
 * These match the exact shape of data from the backend API
 */

// Session DTOs
export interface SessionDTO {
  session_id: string;
  user_id: string;
  ip_address: string;
  timestamp: string;
  created_at?: string;
  risk_score: number;
  decision: string;
  domain: string;
  trust_score?: number;
  anomaly_count?: number;
  threat_level?: string;
  source?: string;
  primary_cause?: string;
  recommended_action?: string;
}

// Incident DTOs
export interface IncidentDTO {
  id: string;
  session_id: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  resolution?: string;
}

// Dashboard DTOs
export interface DashboardMetricsDTO {
  total_sessions: number;
  active_sessions: number;
  active_incidents: number;
  critical_incidents: number;
  avg_risk_score: number;
  blocked_sessions: number;
  global_trust_score: number;
  attack_ratio: number;
  sessions_by_decision?: Record<string, number>;
  sessions_by_severity?: Record<string, number>;
  decision_distribution?: {
    trusted: number;
    suspicious: number;
    malicious: number;
  };
  domain_risk?: {
    web: number;
    api: number;
    network: number;
    infra: number;
  };
  domain_recommendations?: {
    web?: string;
    api?: string;
    network?: string;
    infra?: string;
  };
  risk_velocity?: Array<{ timestamp: string; value: number }>;
  timeline_data?: Array<{ timestamp: string; count: number }>;
  detection_sensitivity?: string;
  primary_risk_vectors?: Array<{ name: string; value: number }>;
}

// User DTOs
export interface UserDTO {
  id: string;
  username: string;
  email: string;
  role: string;
  created_at: string;
  last_login?: string;
}

// Notification DTOs
export interface NotificationDTO {
  id: string;
  message: string;
  severity: string;
  timestamp: string;
  read: boolean;
}

// WebSocket Event DTOs
export interface SessionUpdateDTO {
  type: 'SESSION_UPDATE';
  payload: SessionDTO;
}

export interface IncidentUpdateDTO {
  type: 'INCIDENT_UPDATE' | 'INCIDENT_NEW';
  payload: IncidentDTO;
}

export interface MetricUpdateDTO {
  type: 'METRIC_UPDATE';
  payload: {
    metric_name: string;
    value: number;
    timestamp: string;
  };
}
