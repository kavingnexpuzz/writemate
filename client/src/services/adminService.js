import apiClient from "./apiClient";

export const adminService = {
  getDashboardStats: () =>
    apiClient.get("/admin/dashboard").then((r) => r.data),
  listCustomers: (params) =>
    apiClient.get("/admin/customers", { params }).then((r) => r.data),
  listWriters: (params) =>
    apiClient.get("/admin/writers", { params }).then((r) => r.data),
  listRequests: (params) =>
    apiClient.get("/admin/requests", { params }).then((r) => r.data),
  listPayments: (params) =>
    apiClient.get("/admin/payments", { params }).then((r) => r.data),
  listReviews: (params) =>
    apiClient.get("/admin/reviews", { params }).then((r) => r.data),
  listComplaints: (params) =>
    apiClient.get("/admin/complaints", { params }).then((r) => r.data),
  updateComplaint: (id, payload) =>
    apiClient.put(`/admin/complaints/${id}`, payload).then((r) => r.data),
  listLocations: () => apiClient.get("/admin/locations").then((r) => r.data),
  approveWriter: (id) =>
    apiClient.put(`/admin/writers/${id}/approve`).then((r) => r.data),
  rejectWriter: (id, reason) =>
    apiClient
      .put(`/admin/writers/${id}/reject`, { reason })
      .then((r) => r.data),
  blockWriter: (id) =>
    apiClient.put(`/admin/writers/${id}/block`).then((r) => r.data),
  unblockWriter: (id) =>
    apiClient.put(`/admin/writers/${id}/unblock`).then((r) => r.data),
};

export default adminService;
