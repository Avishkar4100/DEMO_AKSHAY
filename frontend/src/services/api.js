import axios from 'axios';

// API client for /api/* endpoints (dashboard, auth)
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Plain client for non-/api endpoints (login form, logout)
const plain = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Auth endpoints
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Login form endpoint (uses plain client — no /api prefix)
export const loginAPI = {
  form: (data) => plain.post('/login/api', data),
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
