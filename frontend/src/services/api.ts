import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { runtimeConfig } from '../config/runtimeConfig';
import { logger } from './logger';
import { csrfProtection } from '../core/security/csrfProtection';

/**
 * Axios instance with interceptors for auth, tenant, retry logic
 */
class ApiService {
  private instance: AxiosInstance;
  private getToken: (() => string | null) | null = null;
  private getTenantId: (() => string | null) | null = null;
  private getRole: (() => string | null) | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor() {
    this.instance = axios.create({
      baseURL: runtimeConfig.api.baseUrl,
      timeout: runtimeConfig.api.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Set token getter function (called from auth store)
   */
  setTokenGetter(getter: () => string | null) {
    this.getToken = getter;
  }

  /**
   * Set tenant ID getter function (called from tenant store)
   */
  setTenantGetter(getter: () => string | null) {
    this.getTenantId = getter;
  }

  /**
   * Set unauthorized callback (called from auth store)
   */
  setUnauthorizedHandler(handler: () => void) {
    this.onUnauthorized = handler;
  }

  /**
   * Set role getter function (called from auth store)
   */
  setRoleGetter(getter: () => string | null) {
    this.getRole = getter;
  }

  private setupInterceptors() {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add auth token
        if (this.getToken) {
          const token = this.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }

        // Add required backend headers
        config.headers['X-API-Key'] = 'dev-api-key';
        config.headers['X-Platform'] = 'SECURITY_PLATFORM';  // Fixed: Must match Platform enum (USER_PLATFORM or SECURITY_PLATFORM)
        
        // Add role header from auth store
        if (this.getRole) {
          const role = this.getRole();
          if (role) {
            config.headers['X-Role'] = role;
          } else {
            config.headers['X-Role'] = 'VIEWER'; // Default fallback
          }
        } else {
          config.headers['X-Role'] = 'VIEWER'; // Default if no getter set
        }

        // Add tenant header
        if (this.getTenantId) {
          const tenantId = this.getTenantId();
          if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
          }
        }

        // Add CSRF token
        const csrfHeaders = csrfProtection.getHeaders();
        Object.assign(config.headers, csrfHeaders);

        // Log request in development
        if (runtimeConfig.isDevelopment) {
          logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        }

        return config;
      },
      (error) => {
        logger.error('Request interceptor error', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        // Log response in development
        if (runtimeConfig.isDevelopment) {
          logger.debug(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized - Auto logout
        if (error.response?.status === 401) {
          logger.warn('Unauthorized request (401), logging out');
          if (this.onUnauthorized) {
            this.onUnauthorized();
          }
          // Import dynamically to avoid circular dependency
          const { useNotificationStore } = await import('../store/notificationStore');
          useNotificationStore.getState().addNotification(
            'Your session has expired. Please log in again.',
            'warning'
          );
          return Promise.reject(error);
        }

        // Handle 403 Forbidden - Show notification
        if (error.response?.status === 403) {
          logger.warn('Forbidden request (403)', {
            url: originalRequest.url,
          });
          const { useNotificationStore } = await import('../store/notificationStore');
          useNotificationStore.getState().addNotification(
            'You do not have permission to perform this action',
            'error'
          );
          return Promise.reject(error);
        }

        // Handle 500+ Server errors - Show error banner
        if (error.response && error.response.status >= 500) {
          logger.error('Server error (5xx)', error, {
            url: originalRequest?.url,
            status: error.response.status,
          });
          const { useNotificationStore } = await import('../store/notificationStore');
          useNotificationStore.getState().addNotification(
            'Server error occurred. Please try again later.',
            'error'
          );
        }

        // Retry logic for network errors or 5xx errors
        if (
          !originalRequest._retry &&
          (error.code === 'ECONNABORTED' || 
           error.code === 'ERR_NETWORK' ||
           (error.response && error.response.status >= 500))
        ) {
          originalRequest._retry = true;

          // Exponential backoff
          await new Promise(resolve => 
            setTimeout(resolve, runtimeConfig.api.retryDelay)
          );

          logger.info('Retrying failed request', {
            url: originalRequest.url,
            attempt: 1,
          });

          return this.instance(originalRequest);
        }

        logger.error('API Error', error, {
          url: originalRequest?.url,
          status: error.response?.status,
          message: error.message,
        });

        return Promise.reject(error);
      }
    );
  }

  /**
   * Get the axios instance for direct use
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * Convenience methods
   */
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }
}

export const api = new ApiService();

export const trustService = {
  batch: (formData: FormData) => api.post<any>('/api/v1/trust/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  evaluate: (data: any) => api.post<any>('/api/v1/trust/evaluate', data),
  simulate: (data: any) => api.post<any>('/api/v1/simulate', data),
};

export const systemService = {
  health: () => api.get<any>('/api/health'),
};

export const metricsService = {
  getSummary: () => api.get<any>('/api/v1/metrics/summary'),
  getLive: () => api.get<any>('/api/v1/metrics/live'),
};

export const simulationService = {
  startSimulation: () => api.post<any>('/api/v1/simulate/start'),
  endSimulation: (simId: string) => api.post<any>('/api/v1/simulate/end', { simulation_id: simId }), 
  recordEvent: (simId: string, eventType: string, metadata: any = {}) => 
    api.post<any>('/api/v1/simulate/event', { simulation_id: simId, event_type: eventType, features: metadata }),
};

export const userService = {
  listUsers: () => api.get<any>('/api/v1/auth/users'),
  createUser: (data: any) => api.post<any>('/api/v1/auth/users', data),
  updateUser: (userId: string, data: any) => api.put<any>(`/api/v1/auth/users/${userId}`, data),
  deleteUser: (userId: string) => api.delete<any>(`/api/v1/auth/users/${userId}`),
  quarantineUser: (userId: string) => api.post<any>(`/api/v1/enforcement/users/${userId}/terminate`),
  getUserProfile: (userId: string) => api.get<any>(`/api/v1/auth/users/${userId}/profile`)
};

export const socService = {
  getAuditLogs: () => api.get<any>('/api/v1/soc/audit')
};
