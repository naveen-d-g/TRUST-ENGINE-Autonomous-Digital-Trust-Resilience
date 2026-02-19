
export type SystemStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'LOCKDOWN';

export type SocSummaryResponse = {
  system_status: SystemStatus;
  last_updated: string; // ISO timestamp
  
  metrics: {
    active_sessions: number;
    global_risk_score: number; // 0–100
    active_incidents: number;
    risk_velocity: number; // signed float
    allow_count?: number;
    restrict_count?: number;
    escalate_count?: number;
    active_node?: string;
  };

  domain_risk: {
    web: number;
    api: number;
    network: number;
    infra: number;
    system: number;
  };

  operator_focus: {
    headline: string;
    bullets: string[];
  };
};

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export type IncidentSeverity = Severity;
export enum IncidentState {
  OPEN = 'OPEN',
  CONTAINED = 'CONTAINED',
  RECOVERED = 'RECOVERED',
  CLOSED = 'CLOSED'
}

export enum EnforcementState {
  PENDING = 'PENDING',
  PROPOSED = 'PROPOSED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
  FAILED = 'FAILED',
  FAILED_CRASH = 'FAILED_CRASH',
  ROLLED_BACK = 'ROLLED_BACK'
}

export enum EnforcementScope {
  SESSION = 'SESSION',
  USER = 'USER',
  TENANT = 'TENANT'
}

export type IncidentStatus = IncidentState;
export type IncidentDomain = 'WEB' | 'API' | 'NETWORK' | 'INFRA' | 'SYSTEM';

export type IncidentSummary = {
  incident_id: string;
  severity: IncidentSeverity;
  title: string;
  domain: IncidentDomain;
  created_at: string;
  status: IncidentStatus;
};

export type IncidentDetailResponse = {
  incident_id: string;
  severity: IncidentSeverity;
  domain: IncidentDomain;
  status: IncidentStatus;
  created_at: string;
  summary: string;

  involved_entities: {
    sessions: string[];
    users: string[];
    ips: string[];
  };

  decisions: {
    timestamp: string;
    risk_score: number;
    decision: 'ALLOW' | 'MONITOR' | 'RESTRICT' | 'ESCALATE';
    explanation: string[];
  }[];

  enforcement_actions: {
    action_id: string;
    type: 'RATE_LIMIT' | 'CAPTCHA' | 'STEP_UP_AUTH' | 'BLOCK';
    scope: 'SESSION' | 'USER' | 'TENANT';
    status: 'PROPOSED' | 'APPROVED' | 'EXECUTED' | 'ROLLED_BACK';
    justification?: string;
    approved_by?: string;
  }[];

  recovery_actions: {
    type: string;
    executed_at: string;
    result: 'SUCCESS' | 'FAILED';
  }[];
};
