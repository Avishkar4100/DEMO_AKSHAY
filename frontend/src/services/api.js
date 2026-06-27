import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Auth endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Login form endpoint
export const loginAPI = {
  form: (data) => api.post('/login/api', data),
};

// Dashboard endpoints
export const dashboardAPI = {
  metrics: () => api.get('/dashboard/metrics'),
  summary: () => api.get('/dashboard/summary'),
  kpis: () => api.get('/dashboard/statistics/kpis'),
  charts: () => api.get('/dashboard/statistics/charts'),
  realtimeConfig: () => api.get('/dashboard/realtime/config'),
  realtimeStatus: () => api.get('/dashboard/realtime/status'),
};

export default api;
