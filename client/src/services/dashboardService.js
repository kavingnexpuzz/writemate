import apiClient from './apiClient';

export const dashboardService = {
  getMyStats: () => apiClient.get('/users/dashboard-stats').then((r) => r.data),
};

export default dashboardService;
