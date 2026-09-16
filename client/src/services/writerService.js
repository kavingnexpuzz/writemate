import apiClient from './apiClient';

export const writerService = {
  search: (params) => apiClient.get('/writers', { params }).then((r) => r.data),
  getPublicProfile: (id) => apiClient.get(`/writers/${id}`).then((r) => r.data),
};

export default writerService;
