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

// Patients endpoints
export const patientsAPI = {
  list: () => api.get('/dashboard/statistics/patient-stats'),
  create: (data) => api.post('/api/patients', data),
  get: (id) => api.get(`/api/patients/${id}`),
  update: (id, data) => api.put(`/api/patients/${id}`, data),
  delete: (id) => api.delete(`/api/patients/${id}`),
};

// Appointments endpoints
export const appointmentsAPI = {
  list: () => api.get('/dashboard/statistics/appointment-stats'),
  create: (data) => api.post('/api/appointments', data),
  get: (id) => api.get(`/api/appointments/${id}`),
  update: (id, data) => api.put(`/api/appointments/${id}`, data),
  cancel: (id, reason) => api.post(`/api/appointments/${id}/cancel`, { reason }),
};

// Billing endpoints
export const billingAPI = {
  list: () => api.get('/dashboard/statistics/revenue-stats'),
  create: (data) => api.post('/api/billing', data),
  get: (id) => api.get(`/api/billing/${id}`),
  pay: (id, data) => api.post(`/api/billing/${id}/pay`, data),
};

export default api;
