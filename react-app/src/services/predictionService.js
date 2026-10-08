import api from './api';

export const predictionService = {
  getAll: () => api.get('/predictions'),
  generate: (currentBill) => api.post('/predictions/generate', { currentBill }),
};
