import { IncidentState, Severity } from './soc.ts';

export interface Incident {
  incident_id: string;
  title: string;
  severity: Severity;
  status: IncidentState;
  domain: string;
  created_at: string;
  updated_at: string;
  description: string;
  targets: {
    sessions: string[];
    users: string[];
    ips: string[];
  };
  proposals: string[]; // List of Proposal IDs
}
