import { http } from './http';
import { AuditLogEntry } from '../types/audit';

export const auditApi = {
  getAll: async (): Promise<AuditLogEntry[]> => {
    const response = await http.get<AuditLogEntry[]>('/soc/audit');
    return response.data;
  }
};
