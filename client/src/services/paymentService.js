import apiClient from './apiClient';

export const paymentService = {
  getPaymentInfo: (requestId) => apiClient.get(`/payments/payment-info/${requestId}`).then((r) => r.data),
  getByRequest: (requestId) => apiClient.get(`/payments/request/${requestId}`).then((r) => r.data),
  create: (payload) => apiClient.post('/payments', payload).then((r) => r.data),
  list: (params) => apiClient.get('/payments', { params }).then((r) => r.data),
  verify: (id, action, reason) => apiClient.put(`/payments/${id}/verify`, { action, reason }).then((r) => r.data),
};

export default paymentService;
