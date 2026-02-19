import { http } from './http';
import { SocSummaryResponse } from '../types/soc';

export type SocStats = SocSummaryResponse;

export const socApi = {
  getStats: async (): Promise<SocStats> => {
    const response = await http.get<SocStats>('/soc/summary');
    return response.data;
  }
};

