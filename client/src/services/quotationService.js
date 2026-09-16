import apiClient from './apiClient';

export const quotationService = {
  create: (payload) => apiClient.post('/quotations', payload).then((r) => r.data),
  listForRequest: (requestId) => apiClient.get(`/quotations/${requestId}`).then((r) => r.data),
  respond: (id, action) => apiClient.put(`/quotations/${id}`, { action }).then((r) => r.data),
};

export default quotationService;
