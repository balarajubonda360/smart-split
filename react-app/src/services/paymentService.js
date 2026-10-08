import api from './api';

export const paymentService = {
  getPayments: () => api.get('/payments'),
  getPayment: (id) => api.get(`/payments/${id}`),
  createPayment: (payload) => api.post('/payments/create', payload),
  process: (payload) => api.post('/payments/process', payload),
  refund: (id) => api.post(`/payments/${id}/refund`),
};
