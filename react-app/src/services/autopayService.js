import api from './api';

export const autopayService = {
  get: () => api.get('/autopay'),
  save: (payload) => api.post('/autopay', payload),
  update: (id, payload) => api.put(`/autopay/${id}`, payload),
  remove: (id) => api.delete(`/autopay/${id}`),
};
