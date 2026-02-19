import { Severity } from './soc.ts';

export interface AuditLogEntry {
  event_id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: string; // SUCCESS, FAILURE, etc.
  details: string;
  severity: Severity; // Reuse Severity or define AuditSeverity
  metadata?: Record<string, any>;
}
