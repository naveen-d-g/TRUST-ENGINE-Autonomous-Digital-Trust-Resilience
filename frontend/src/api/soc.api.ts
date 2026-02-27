import { api } from '../services/api';
import { SocSummaryResponse } from '../types/soc';

export type SocStats = SocSummaryResponse;

export const socApi = {
  getStats: async (): Promise<SocStats> => {
    const response = await api.get<SocStats>('/api/v1/soc/summary');
    return response;
  },
  enforceReset: async (): Promise<any> => {
    const response = await api.post<any>('/api/v1/soc/reset_simulation');
    return response;
  }
};

