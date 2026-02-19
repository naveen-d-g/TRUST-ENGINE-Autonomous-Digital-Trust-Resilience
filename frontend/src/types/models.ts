/**
 * Frontend Model types
 * These are the normalized, frontend-friendly data structures
 */

// Session Model
export interface SessionModel {
  id: string;
  userId: string;
  ipAddress: string;
  timestamp: Date;
  riskScore: number;
  decision: string;
  domain: string;
  trustScore: number;
  anomalyCount: number;
  threatLevel: string;
  source: string;
  label?: string; // MALICIOUS, SUSPICIOUS, BENIGN
  lastSeen?: Date;
  primaryCause?: string;
  recommendedAction?: string;
}

// Incident Model
export interface IncidentModel {
  id: string;
  sessionId: string;
  severity: string;
  status: string;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  assignedTo?: string;
  resolution?: string;
}

// Dashboard Metrics Model
export interface DashboardMetrics {
  totalSessions: number;
  activeSessions: number;
  activeIncidents: number;
  criticalIncidents: number;
  avgRiskScore: number;
  blockedSessions: number;
  globalTrustScore: number;
  attackRatio: number;
  sessionsByDecision: Record<string, number>;
  sessionsBySeverity: Record<string, number>;
  decisionDistribution: {
    trusted: number;
    suspicious: number;
    malicious: number;
  };
  domainRisk: {
    web: number;
    api: number;
    network: number;
    infra: number;
  };
  domainRecommendations?: {
    web?: string;
    api?: string;
    network?: string;
    infra?: string;
  };
  riskVelocity: Array<{ timestamp: Date; value: number }>;
  timelineData: Array<{ timestamp: Date; count: number }>;
  detectionSensitivity: string;
  primaryRiskVectors: Array<{ name: string; value: number }>;
}

// User Model
export interface UserModel {
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Notification Model
export interface NotificationModel {
  id: string;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}
