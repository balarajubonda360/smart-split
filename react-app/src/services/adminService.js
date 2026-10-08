import api from './api';

export const adminService = {
  overview: () => api.get('/admin/overview'),
  users: () => api.get('/admin/users'),
  households: () => api.get('/admin/households'),
  bills: () => api.get('/admin/bills'),
  payments: () => api.get('/admin/payments'),
  disputes: () => api.get('/admin/disputes'),
};
