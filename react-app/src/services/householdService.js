import api from './api';

export const householdService = {
  getHouseholds: () => api.get('/households'),
  createHousehold: (payload) => api.post('/households', payload),
  getMembers: (id) => api.get(`/households/${id}/members`),
  addMember: (id, payload) => api.post(`/households/${id}/members`, payload),
  removeMember: (memberId) => api.delete(`/members/${memberId}`),
  getSummary: () => api.get('/households/summary'),
};
