import { http } from './http';
import { Proposal } from '../types/enforcement';

export const enforcementApi = {
  getAll: async (): Promise<Proposal[]> => {
    const response = await http.get<Proposal[]>('/soc/proposals');
    return response.data;
  },

  approve: async (pid: string, justification: string): Promise<void> => {
    await http.post(`/soc/proposals/${pid}/approve`, { justification });
  },

  reject: async (pid: string, justification: string): Promise<void> => {
     await http.post(`/soc/proposals/${pid}/reject`, { justification });
  }
};
