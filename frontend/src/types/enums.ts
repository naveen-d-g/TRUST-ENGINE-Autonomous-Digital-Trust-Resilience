/**
 * TypeScript enumerations for type safety
 */

export enum UserRole {
  ADMIN = 'ADMIN',
  ANALYST = 'ANALYST',
  VIEWER = 'VIEWER',
}

export enum Severity {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
  INFO = 'INFO',
}

export enum RiskLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

export enum DecisionType {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
  CHALLENGE = 'CHALLENGE',
  MONITOR = 'MONITOR',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CONTAINED = 'CONTAINED',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum ProposalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  EXECUTED = 'EXECUTED',
}

export enum DomainType {
  WEB = 'WEB',
  API = 'API',
  NETWORK = 'NETWORK',
  INFRA = 'INFRA',
}

export enum AttackType {
  BRUTE_FORCE = 'BRUTE_FORCE',
  SQL_INJECTION = 'SQL_INJECTION',
  XSS = 'XSS',
  CREDENTIAL_STUFFING = 'CREDENTIAL_STUFFING',
  DOS = 'DOS',
  MALWARE = 'MALWARE',
}

export enum NotificationSeverity {
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
}
