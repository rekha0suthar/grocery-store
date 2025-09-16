import api from './api.js';

export const authService = {
  // System initialization
  async checkInitializationStatus() {
    const response = await api.get('/auth/initialization-status');
    return response;
  },

  async initializeSystem(adminData) {
    const response = await api.post('/auth/initialize', adminData);
    return response;
  },

  // Authentication
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  async logout() {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Optional: Call backend logout endpoint
    try {
      const response = await api.post('/auth/logout');
      return response;
    } catch (error) {
      // Even if backend call fails, we've cleared local storage
      return { data: { success: true, message: 'Logged out successfully' } };
    }
  },

  // Profile management
  async getProfile() {
    const response = await api.get('/auth/profile');
    return response;
  },

  async updateProfile(profileData) {
    console.log('profileData', profileData);
    const response = await api.put('/auth/profile', profileData);
    console.log('response', response);
    return response;
  },

  async changePassword(passwordData) {
    const response = await api.put('/auth/change-password', passwordData);
    return response;
  },

  // Admin-only store manager management
  async getPendingStoreManagerRequests() {
    const response = await api.get('/auth/store-manager-requests');
    return response;
  },

  async approveStoreManagerRequest(requestId, action, reason = null) {
    const response = await api.put(`/auth/store-manager-requests/${requestId}`, {
      action,
      reason
    });
    return response;
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response;
  },
};
