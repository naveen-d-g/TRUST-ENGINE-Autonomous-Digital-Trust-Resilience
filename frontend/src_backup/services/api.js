import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for Auth
api.interceptors.request.use(
  (config) => {
    // Standardize on X-API-Key for dev/demo
    config.headers['X-API-Key'] = 'dev-api-key';
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Check if the response matches our standard wrap { success: true, ... }
    if (response.data && response.data.success === false) {
       return Promise.reject(new Error(response.data.message || 'API Error'));
    }
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    if (status === 401) {
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    console.warn('API Error:', message);
    error.message = message;
    return Promise.reject(error);
  }
);

export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const trustService = {
  evaluate: (features) => api.post('/trust/evaluate', features),
  batch: (formData) => api.post('/trust/batch', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const metricsService = {
  getSummary: () => api.get('/metrics/summary'),
  getSession: (id) => api.get(`/metrics/session/${id}`),
  getSessions: (limit = 50, offset = 0, decision = 'ALL') => api.get('/metrics/sessions', { params: { limit, offset, decision } }),
};

export const systemService = {
  health: () => api.get('/health'),
};

export const userService = {
  createUser: (userData) => api.post('/users/create', userData),
  listUsers: () => api.get('/users/list'),
  updateUser: (userId, userData) => api.put(`/users/update/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/delete/${userId}`),
};

export const simulationService = {
  startSimulation: () => api.post('/sim/start'),
  recordEvent: (simulationId, eventType, metadata = {}) => api.post('/sim/event', {
      simulation_id: simulationId,
      event_type: eventType,
      features: metadata
  }),
  endSimulation: (simulationId) => api.post('/sim/end', { simulation_id: simulationId }),
  getSimulation: (simulationId) => api.get(`/sim/${simulationId}`),
};

export const demoService = {
  startDemo: () => api.post('/demo/start'),
  recordEvent: (demoId, eventType, metadata = {}) => api.post('/demo/event', {
      demo_session_id: demoId,
      event_type: eventType,
      features: metadata
  }),
  endDemo: (demoId) => api.post('/demo/end', { demo_session_id: demoId }),
  getAllDemoSessions: (limit = 20, offset = 0) => api.get('/demo/sessions', { params: { limit, offset } }),
  getDemoDetails: (demoId) => api.get(`/demo/${demoId}`),
};

export const liveService = {
  getLiveStream: () => api.get('/live/stream'),
  // Generic ingest for testing if needed from frontend
  ingest: (type, payload) => api.post(`/live/ingest/${type}`, payload),
};

export default api;
