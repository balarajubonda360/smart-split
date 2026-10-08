import api from './api';

export const billService = {
  getBills: () => api.get('/bills'),
  getBill: (id) => api.get(`/bills/${id}`),
  syncBills: () => api.post('/bills/sync'),
  calculateSplit: (payload) => api.post('/splits/calculate', payload),
  getSplits: (id) => api.get(`/bills/${id}/splits`),
  getUtilityBills: (type) => api.get(`/utilities/${type}/bills`),
};
