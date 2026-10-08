import api from './api';

export const disputeService = {
  getAll: () => api.get('/disputes'),
  create: (payload) => api.post('/disputes', payload),
  updateStatus: (id, status) => api.put(`/disputes/${id}/status`, { status }),
};
