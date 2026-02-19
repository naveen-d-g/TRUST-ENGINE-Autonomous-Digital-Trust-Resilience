import { http } from './http';
import { Incident } from '../types/incident';
import { IncidentDetailResponse, Severity, IncidentDomain, IncidentState } from '../types/soc';

export const incidentApi = {
  getAll: async (): Promise<Incident[]> => {
    const response = await http.get<Incident[]>('/soc/incidents');
    return response.data;
  },

  getById: async (id: string): Promise<IncidentDetailResponse> => {
    interface RawIncident {
      incident_id?: string;
      severity?: Severity;
      domain?: IncidentDomain;
      status?: IncidentState;
      created_at?: string;
      title?: string;
      description?: string;
      targets?: {
        sessions?: string[];
        users?: string[];
        ips?: string[];
      };
      decisions?: {
        timestamp: string;
        risk_score: number;
        decision: 'ALLOW' | 'MONITOR' | 'RESTRICT' | 'ESCALATE';
        explanation: string[];
      }[]; 
      enforcement_actions?: {
        action_id: string;
        type: 'RATE_LIMIT' | 'CAPTCHA' | 'STEP_UP_AUTH' | 'BLOCK';
        scope: 'SESSION' | 'USER' | 'TENANT';
        status: 'PROPOSED' | 'APPROVED' | 'EXECUTED' | 'ROLLED_BACK';
        justification?: string;
        approved_by?: string;
      }[]; 
      recovery_actions?: {
        type: string;
        executed_at: string;
        result: 'SUCCESS' | 'FAILED';
      }[];
    }
    const response = await http.get<RawIncident>(`/soc/incidents/${id}`);
    const raw = response.data;

    return {
      incident_id: raw.incident_id || id,
      severity: raw.severity || Severity.MEDIUM,
      domain: raw.domain || 'SYSTEM',
      status: raw.status || IncidentState.OPEN,
      created_at: raw.created_at || new Date().toISOString(),
      summary: raw.title || raw.description || 'No summary provided',
      
      involved_entities: {
        sessions: raw.targets?.sessions || [],
        users: raw.targets?.users || [],
        ips: raw.targets?.ips || []
      },

      decisions: raw.decisions || [], 
      enforcement_actions: raw.enforcement_actions || [], 
      recovery_actions: raw.recovery_actions || []
    };
  }
};
