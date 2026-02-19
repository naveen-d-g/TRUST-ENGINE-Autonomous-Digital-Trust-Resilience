import { EnforcementState, EnforcementScope, Severity } from './soc.ts';

export interface BlastRadius {
  affected_users: number;
  tenant_scope: boolean;
}

export interface ThreatAssessment {
  severity: Severity;
  confidence_score: number;
  blast_radius: BlastRadius;
  threats: string[];
}

export interface Proposal {
  pid: string;
  session_id: string;
  user_id: string;
  tenant_id: string;
  action: string;
  scope: EnforcementScope;
  status: EnforcementState;
  created_at: string;
  expires_at: string;
  risk_score: number;
  justification?: string;
  threat_assessment: ThreatAssessment;
  metadata: Record<string, any>;
}
