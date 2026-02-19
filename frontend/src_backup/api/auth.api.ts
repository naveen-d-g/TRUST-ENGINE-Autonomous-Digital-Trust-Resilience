import { http } from './http';
import { AuthResponse } from '../types/auth';

export const authApi = {
  getMe: async (): Promise<AuthResponse> => {
    const response = await http.get<AuthResponse>('/auth/me');
    return response.data;
  },
  
  // Login/Logout might be handled via form post or separate API, 
  // but let's add them for completeness if needed later.
  login: async (): Promise<void> => {
    await http.post('/auth/login');
  },
  
  logout: async (): Promise<void> => {
    await http.post('/auth/logout');
  }
};
