import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Base API Configuration
const API_BASE_URL = '/api/v1';

export const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'dev-api-key', // Hardcoded for dev/demo environment
    'X-Tenant-ID': 'tenant_1',  // Standardized for dev alignment
    'X-Platform': 'SECURITY_PLATFORM',
    'X-Role': 'ADMIN',
  },
  withCredentials: true, // Important for session cookies
});

// Response Interceptor
http.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // Unauthorized - Redirect to Login
      // We use window.location because we might be outside React context
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      // Forbidden - Permission Denied
      console.error('Permission Denied: You do not have access to this resource.');
      // Ideally, dispatch a global toast/banner event here
      const event = new CustomEvent('soc:error', { 
        detail: { message: 'Permission Denied', code: 403 } 
      });
      window.dispatchEvent(event);
    } else if (status === 409) {
        // Conflict - State mismatch
        const event = new CustomEvent('soc:error', { 
            detail: { message: 'State Conflict: Action may have already been taken.', code: 409 } 
        });
        window.dispatchEvent(event);
    } else if (status === 412) {
        // Precondition Failed - Stale Context
        const event = new CustomEvent('soc:error', { 
            detail: { message: 'Stale Context: Please refresh the page.', code: 412 } 
        });
        window.dispatchEvent(event);
    }

    return Promise.reject(error);
  }
);
