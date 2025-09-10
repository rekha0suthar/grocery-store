import api from './api.js';

export const requestService = {
  async getRequests(params = {}) {
    const response = await api.get('/requests', { params });
    return response;
  },

  async getRequestById(id) {
    const response = await api.get(`/requests/${id}`);
    return response;
  },

  async createStoreManagerRequest(requestData) {
    const response = await api.post('/requests/store-manager', requestData);
    return response;
  },

  async approveRequest(id) {
    const response = await api.patch(`/requests/${id}/approve`);
    return response;
  },

  async rejectRequest(id) {
    const response = await api.patch(`/requests/${id}/reject`);
    return response;
  },

  async getMyRequests(params = {}) {
    const response = await api.get('/requests/my', { params });
    return response;
  },
};
