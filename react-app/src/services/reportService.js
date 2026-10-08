import api from './api';

export const reportService = {
  getMonthly: () => api.get('/reports/monthly'),
  getUtilities: () => api.get('/reports/utilities'),
  getMembers: () => api.get('/reports/members'),
  getPayments: () => api.get('/reports/payments'),
};
