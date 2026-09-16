import apiClient from "./apiClient";

export const requestService = {
  create: (formData) =>
    apiClient
      .post("/requests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),
  list: (params) => apiClient.get("/requests", { params }).then((r) => r.data),
  getById: (id) => apiClient.get(`/requests/${id}`).then((r) => r.data),
  update: (id, payload) =>
    apiClient.put(`/requests/${id}`, payload).then((r) => r.data),
  remove: (id) => apiClient.delete(`/requests/${id}`).then((r) => r.data),
  cancel: (id, reason) =>
    apiClient.post(`/requests/${id}/cancel`, { reason }).then((r) => r.data),
  getMatchedWriters: (id) =>
    apiClient.get(`/requests/matched-writers/${id}`).then((r) => r.data),
  writerAccept: (id) =>
    apiClient.post(`/requests/${id}/accept`).then((r) => r.data),
  writerReject: (id) =>
    apiClient.post(`/requests/${id}/reject`).then((r) => r.data),
  writerStart: (id) =>
    apiClient.post(`/requests/${id}/start`).then((r) => r.data),
  writerComplete: (id) =>
    apiClient.post(`/requests/${id}/complete`).then((r) => r.data),
};

export default requestService;
